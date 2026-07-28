"use server";

import { revalidatePath } from "next/cache";
import { ApiError, apiRequest } from "@/lib/api-client";
import { getCurrentUser } from "@/lib/dal";
import { getSessionToken } from "@/lib/session";
import type { TechnicianAction } from "@/lib/types";

export type JobStatusResult = { ok: true } | { ok: false; message: string };

const ALLOWED: TechnicianAction[] = [
  "accept",
  "decline",
  "in_progress",
  "complete",
];

export const updateJobStatusAction = async (
  bookingId: string,
  status: TechnicianAction,
): Promise<JobStatusResult> => {
  const user = await getCurrentUser();

  if (!user) {
    return { ok: false, message: "Your session expired. Please sign in again." };
  }

  if (user.role !== "technician") {
    return { ok: false, message: "Only technicians can update job status." };
  }

  if (!ALLOWED.includes(status)) {
    return { ok: false, message: "That status is not allowed." };
  }

  try {
    await apiRequest(`/api/technician/bookings/${bookingId}`, {
      method: "PATCH",
      token: await getSessionToken(),
      body: { status },
    });

    revalidatePath("/dashboard/jobs");

    return { ok: true };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, message: error.message };
    }

    return { ok: false, message: "Could not update the job. Please try again." };
  }
};
