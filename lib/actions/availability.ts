"use server";

import { revalidatePath } from "next/cache";
import { ApiError, apiRequest } from "@/lib/api-client";
import { getCurrentUser } from "@/lib/dal";
import { getSessionToken } from "@/lib/session";
import { availabilitySchema } from "@/lib/validations/availability";
import type { Availability } from "@/lib/types";

export type AvailabilityResult =
  | { ok: true; availability: Availability[] }
  | { ok: false; message: string };

export const updateAvailabilityAction = async (
  values: unknown,
): Promise<AvailabilityResult> => {
  const user = await getCurrentUser();

  if (!user) {
    return { ok: false, message: "Your session expired. Please sign in again." };
  }

  if (user.role !== "technician") {
    return { ok: false, message: "Only technicians can set availability." };
  }

  const parsed = availabilitySchema.safeParse(values);

  if (!parsed.success) {
    return { ok: false, message: "Please fix the highlighted time blocks." };
  }

  try {
    const availability = await apiRequest<Availability[]>(
      "/api/technician/availability",
      {
        method: "PUT",
        token: await getSessionToken(),
        body: { slots: parsed.data.slots },
      },
    );

    revalidatePath("/dashboard", "layout");

    return { ok: true, availability: availability ?? [] };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, message: error.message };
    }

    return { ok: false, message: "Something went wrong. Please try again." };
  }
};
