"use server";

import {
  ApiError,
  apiRequestWithResponse,
  readCookieFromResponse,
} from "@/lib/api-client";
import { createSession } from "@/lib/session";
import { loginSchema } from "@/lib/validations/auth";
import type { User } from "@/lib/types";

export type LoginResult =
  | { ok: true; redirectTo: string }
  | { ok: false; message: string };

const GENERIC_FAILURE = "Invalid email or password.";

const safeRedirect = (value: unknown) =>
  typeof value === "string" &&
  value.startsWith("/") &&
  !value.startsWith("//") &&
  !value.startsWith("/login") &&
  !value.startsWith("/register")
    ? value
    : "/";

export const loginAction = async (
  values: unknown,
  redirectTo?: string,
): Promise<LoginResult> => {
  const parsed = loginSchema.safeParse(values);

  if (!parsed.success) {
    return { ok: false, message: GENERIC_FAILURE };
  }

  try {
    const { data, response } = await apiRequestWithResponse<User>(
      "/api/auth/login",
      { method: "POST", body: parsed.data },
    );

    if (data?.status === "ban") {
      return {
        ok: false,
        message: "This account has been suspended. Please contact support.",
      };
    }

    const accessToken = readCookieFromResponse(response, "accessToken");
    const refreshToken = readCookieFromResponse(response, "refreshToken");

    if (!accessToken) {
      return {
        ok: false,
        message: "Could not start a session. Please try again.",
      };
    }

    await createSession(accessToken, refreshToken);

    return { ok: true, redirectTo: safeRedirect(redirectTo) };
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401 || error.status === 404) {
        return { ok: false, message: GENERIC_FAILURE };
      }

      return { ok: false, message: error.message };
    }

    return { ok: false, message: "Something went wrong. Please try again." };
  }
};
