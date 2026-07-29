"use server";

import { ApiError, apiRequest } from "@/lib/api-client";
import { registerSchema } from "@/lib/validations/auth";
import type { User } from "@/lib/types";

export type RegisterResult = { ok: true } | { ok: false; message: string };

export const registerAction = async (
  values: unknown,
): Promise<RegisterResult> => {
  const parsed = registerSchema.safeParse(values);

  if (!parsed.success) {
    return { ok: false, message: "Please check the form and try again." };
  }

  const { name, email, phone_no, password, role } = parsed.data;

  try {
    await apiRequest<User>("/api/auth/register", {
      method: "POST",
      body: { name, email, phone_no, password, role },
    });

    return { ok: true };
  } catch (error) {
    if (error instanceof ApiError) {
      const message =
        error.status === 409
          ? "An account with this email already exists."
          : error.message;

      return { ok: false, message };
    }

    return { ok: false, message: "Something went wrong. Please try again." };
  }
};
