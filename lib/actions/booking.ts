"use server";

import { revalidatePath } from "next/cache";
import { ApiError, apiRequest } from "@/lib/api-client";
import { getCurrentUser } from "@/lib/dal";
import { getSessionToken } from "@/lib/session";
import { isWithinAvailability } from "@/lib/availability";
import { bookingSchema } from "@/lib/validations/booking";
import type { Booking, ServiceDetail } from "@/lib/types";

export type BookingResult =
  | { ok: true; bookingId: string }
  | { ok: false; message: string };

export const createBookingAction = async (
  serviceId: string,
  values: unknown,
): Promise<BookingResult> => {
  const user = await getCurrentUser();

  if (!user) {
    return {
      ok: false,
      message: "Please sign in to book this service.",
    };
  }

  if (user.role === "admin") {
    return { ok: false, message: "Admin accounts cannot book services." };
  }

  const parsed = bookingSchema.safeParse(values);

  if (!parsed.success) {
    return { ok: false, message: "Please check the form and try again." };
  }

  let service: ServiceDetail | undefined;

  try {
    service = await apiRequest<ServiceDetail>(`/api/services/${serviceId}`, {
      cache: "no-store",
    });
  } catch {
    return { ok: false, message: "This service is no longer available." };
  }

  if (!service) {
    return { ok: false, message: "This service is no longer available." };
  }

  if (service.technician.user_id === user.id) {
    return { ok: false, message: "You cannot book your own service." };
  }

  const scheduledAt = new Date(parsed.data.scheduled_at);

  if (!isWithinAvailability(scheduledAt, service.technician.availability)) {
    return {
      ok: false,
      message: "That time is outside the technician's working hours.",
    };
  }

  try {
    const token = await getSessionToken();
    const booking = await apiRequest<Booking>("/api/bookings", {
      method: "POST",
      token,
      body: {
        service_id: serviceId,
        scheduled_at: scheduledAt.toISOString(),
        address: parsed.data.address,
        ...(parsed.data.note ? { note: parsed.data.note } : {}),
      },
    });

    revalidatePath(`/services/${serviceId}`);

    return { ok: true, bookingId: booking?.id ?? "" };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, message: error.message };
    }

    return { ok: false, message: "Could not create the booking. Try again." };
  }
};

export type CancelBookingResult = { ok: true } | { ok: false; message: string };

export const cancelBookingAction = async (
  bookingId: string,
): Promise<CancelBookingResult> => {
  const token = await getSessionToken();

  if (!token) {
    return { ok: false, message: "Your session expired. Please sign in again." };
  }

  try {
    await apiRequest<Booking>(`/api/bookings/${bookingId}/cancel`, {
      method: "PATCH",
      token,
    });

    revalidatePath("/dashboard/customer/bookings");
    revalidatePath(`/dashboard/customer/bookings/${bookingId}`);

    return { ok: true };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, message: error.message };
    }

    return { ok: false, message: "Could not cancel the booking. Try again." };
  }
};
