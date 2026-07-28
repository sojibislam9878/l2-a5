import { secondsUntilExpiry } from "./jwt";

export const ACCESS_COOKIE = "session";
export const REFRESH_COOKIE = "session_refresh";

const ACCESS_FALLBACK_MAX_AGE = 60 * 60 * 24;
const REFRESH_FALLBACK_MAX_AGE = 60 * 60 * 24 * 7;

export const REFRESH_SKEW_SECONDS = 60;

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

const maxAgeFor = (token: string, fallback: number) => {
  const remaining = secondsUntilExpiry(token);

  return remaining !== undefined && remaining > 0 ? remaining : fallback;
};

export const accessCookieMaxAge = (token: string) =>
  maxAgeFor(token, ACCESS_FALLBACK_MAX_AGE);

export const refreshCookieMaxAge = (token: string) =>
  maxAgeFor(token, REFRESH_FALLBACK_MAX_AGE);
