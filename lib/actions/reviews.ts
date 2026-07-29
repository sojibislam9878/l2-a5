"use server";

import { revalidatePath } from "next/cache";
import { ApiError, apiRequest } from "@/lib/api-client";
import { getCurrentUser } from "@/lib/dal";
import { getSessionToken } from "@/lib/session";
import { reviewSchema } from "@/lib/validations/review";

export type ReviewResult = { ok: true } | { ok: false; message: string };

export const createReviewAction = async (
  bookingId: string,
  values: unknown,
): Promise<ReviewResult> => {
  const user = await getCurrentUser();

  if (!user) {
    return { ok: false, message: "Your session expired. Please sign in again." };
  }

  if (user.role === "admin") {
    return { ok: false, message: "Admin accounts cannot leave reviews." };
  }

  const parsed = reviewSchema.safeParse(values);

  if (!parsed.success) {
    return {
      ok: false,
      message:
        parsed.error.issues[0]?.message ??
        "Please check the form and try again.",
    };
  }

  try {
    await apiRequest("/api/reviews", {
      method: "POST",
      token: await getSessionToken(),
      body: {
        booking_id: bookingId,
        rating: parsed.data.rating,
        comment: parsed.data.comment,
      },
    });

    revalidatePath("/dashboard/customer/bookings");
    revalidatePath(`/dashboard/customer/bookings/${bookingId}`);
    revalidatePath("/services");
    revalidatePath("/technicians");
    revalidatePath("/");

    return { ok: true };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, message: error.message };
    }

    return { ok: false, message: "Could not submit your review. Try again." };
  }
};
