"use server";

import { ApiError, apiRequest } from "@/lib/api-client";
import { getCurrentUser } from "@/lib/dal";
import { getSessionToken } from "@/lib/session";
import type { BookingDetail } from "@/lib/types";

export type PaymentResult =
  | { ok: true; url: string }
  | { ok: false; message: string };

export const startPaymentAction = async (
  bookingId: string,
): Promise<PaymentResult> => {
  const user = await getCurrentUser();

  if (!user) {
    return { ok: false, message: "Your session expired. Please sign in again." };
  }

  if (user.role === "admin") {
    return { ok: false, message: "Admin accounts cannot pay for bookings." };
  }

  try {
    const booking = await apiRequest<BookingDetail>(
      `/api/bookings/${bookingId}`,
      { token: await getSessionToken(), cache: "no-store" },
    );

    if (booking?.technician.user_id === user.id) {
      return { ok: false, message: "You cannot pay for your own service." };
    }

    const result = await apiRequest<{ url: string | null }>(
      "/api/payments/create",
      {
        method: "POST",
        token: await getSessionToken(),
        body: { booking_id: bookingId },
      },
    );

    if (!result?.url) {
      return {
        ok: false,
        message: "Stripe did not return a checkout link. Please try again.",
      };
    }

    return { ok: true, url: result.url };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, message: error.message };
    }

    return { ok: false, message: "Could not start checkout. Please try again." };
  }
};
