import "server-only";

import { cache } from "react";
import { apiRequest } from "./api-client";
import { getSessionToken } from "./session";
import type { User } from "./types";

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const token = await getSessionToken();

  if (!token) {
    return null;
  }

  try {
    return (await apiRequest<User>("/api/auth/me", { token, cache: "no-store" })) ?? null;
  } catch {
    return null;
  }
});
