"use server";

import { revalidatePath } from "next/cache";
import { ApiError, apiRequest } from "@/lib/api-client";
import { getSessionToken } from "@/lib/session";
import { profileSchema } from "@/lib/validations/profile";
import type { User } from "@/lib/types";

export type ProfileResult =
  | { ok: true; user: User }
  | { ok: false; message: string };

export const updateProfileAction = async (
  values: unknown,
): Promise<ProfileResult> => {
  const token = await getSessionToken();

  if (!token) {
    return { ok: false, message: "Your session expired. Please sign in again." };
  }

  const parsed = profileSchema.safeParse(values);

  if (!parsed.success) {
    return { ok: false, message: "Please check the form and try again." };
  }

  try {
    const user = await apiRequest<User>("/api/auth/me", {
      method: "PATCH",
      token,
      body: {
        name: parsed.data.name,
        phone_no: parsed.data.phone_no,
      },
    });

    if (!user) {
      return { ok: false, message: "Could not update your profile." };
    }

    revalidatePath("/dashboard/profile");
    revalidatePath("/", "layout");

    return { ok: true, user };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, message: error.message };
    }

    return { ok: false, message: "Something went wrong. Please try again." };
  }
};
