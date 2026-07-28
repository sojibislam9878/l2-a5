import "server-only";

import { cache } from "react";
import { apiRequest } from "./api-client";
import { getSessionToken } from "./session";
import type { CurrentUser } from "./types";

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const token = await getSessionToken();

  if (!token) {
    return null;
  }

  try {
    return (
      (await apiRequest<CurrentUser>("/api/auth/me", {
        token,
        cache: "no-store",
      })) ?? null
    );
  } catch {
    return null;
  }
});
