import "server-only";

import { cookies } from "next/headers";

const SESSION_COOKIE = "session";
const FALLBACK_MAX_AGE = 60 * 60 * 24;

const decodeExpiry = (token: string) => {
  const segments = token.split(".");

  if (segments.length !== 3) {
    return undefined;
  }

  try {
    const claims = JSON.parse(
      Buffer.from(segments[1], "base64url").toString("utf8"),
    ) as { exp?: unknown };

    return typeof claims.exp === "number" ? claims.exp : undefined;
  } catch {
    return undefined;
  }
};

export const createSession = async (token: string) => {
  const expiry = decodeExpiry(token);
  const secondsLeft = expiry
    ? expiry - Math.floor(Date.now() / 1000)
    : FALLBACK_MAX_AGE;

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: secondsLeft > 0 ? secondsLeft : FALLBACK_MAX_AGE,
  });
};

export const getSessionToken = async () => {
  const cookieStore = await cookies();

  return cookieStore.get(SESSION_COOKIE)?.value;
};

export const deleteSession = async () => {
  const cookieStore = await cookies();

  cookieStore.delete(SESSION_COOKIE);
};
