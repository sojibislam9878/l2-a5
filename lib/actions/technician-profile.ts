"use server";

import { revalidatePath } from "next/cache";
import { ApiError, apiRequest } from "@/lib/api-client";
import { getCurrentUser } from "@/lib/dal";
import { getSessionToken } from "@/lib/session";
import { technicianProfileSchema } from "@/lib/validations/technician-profile";
import type { TechnicianProfileDetail } from "@/lib/types";

export type TechnicianProfileResult =
  | { ok: true; profile: TechnicianProfileDetail }
  | { ok: false; message: string };

export const updateTechnicianProfileAction = async (
  values: unknown,
): Promise<TechnicianProfileResult> => {
  const user = await getCurrentUser();

  if (!user) {
    return { ok: false, message: "Your session expired. Please sign in again." };
  }

  if (user.role !== "technician") {
    return { ok: false, message: "Only technicians have a service profile." };
  }

  const parsed = technicianProfileSchema.safeParse(values);

  if (!parsed.success) {
    return { ok: false, message: "Please check the form and try again." };
  }

  const { bio, skills, experience_year, hourly_rate } = parsed.data;

  try {
    const profile = await apiRequest<TechnicianProfileDetail>(
      "/api/technician/profile",
      {
        method: "PUT",
        token: await getSessionToken(),
        body: {
          bio,
          skills,
          ...(experience_year !== "" && {
            experience_year: Number(experience_year),
          }),
          ...(hourly_rate !== "" && { hourly_rate: Number(hourly_rate) }),
        },
      },
    );

    if (!profile) {
      return { ok: false, message: "Could not update your service profile." };
    }

    revalidatePath("/dashboard/profile");

    return { ok: true, profile };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, message: error.message };
    }

    return { ok: false, message: "Something went wrong. Please try again." };
  }
};
