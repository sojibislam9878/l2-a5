import "server-only";

import { cookies } from "next/headers";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  accessCookieMaxAge,
  cookieOptions,
  refreshCookieMaxAge,
} from "./session-config";

export const createSession = async (
  accessToken: string,
  refreshToken?: string,
) => {
  const cookieStore = await cookies();

  cookieStore.set(ACCESS_COOKIE, accessToken, {
    ...cookieOptions,
    maxAge: accessCookieMaxAge(accessToken),
  });

  if (refreshToken) {
    cookieStore.set(REFRESH_COOKIE, refreshToken, {
      ...cookieOptions,
      maxAge: refreshCookieMaxAge(refreshToken),
    });
  }
};

export const getSessionToken = async () => {
  const cookieStore = await cookies();

  return cookieStore.get(ACCESS_COOKIE)?.value;
};

export const getRefreshToken = async () => {
  const cookieStore = await cookies();

  return cookieStore.get(REFRESH_COOKIE)?.value;
};

export const deleteSession = async () => {
  const cookieStore = await cookies();

  cookieStore.delete(ACCESS_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);
};
