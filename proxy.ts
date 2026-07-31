import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isExpiringWithin } from "@/lib/jwt";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  REFRESH_SKEW_SECONDS,
  accessCookieMaxAge,
  cookieOptions,
  refreshCookieMaxAge,
} from "@/lib/session-config";

const readSetCookie = (response: Response, name: string) => {
  for (const cookie of response.headers.getSetCookie()) {
    const [pair] = cookie.split(";");
    const separator = pair.indexOf("=");

    if (separator > 0 && pair.slice(0, separator).trim() === name) {
      return decodeURIComponent(pair.slice(separator + 1).trim());
    }
  }

  return undefined;
};

const requestWithTokens = (
  request: NextRequest,
  accessToken: string,
  refreshToken: string,
) => {
  const headers = new Headers(request.headers);
  const preserved = request.cookies
    .getAll()
    .filter(({ name }) => name !== ACCESS_COOKIE && name !== REFRESH_COOKIE)
    .map(({ name, value }) => `${name}=${value}`);

  headers.set(
    "cookie",
    [
      ...preserved,
      `${ACCESS_COOKIE}=${accessToken}`,
      `${REFRESH_COOKIE}=${refreshToken}`,
    ].join("; "),
  );

  return headers;
};

const PROTECTED_PREFIXES = ["/dashboard", "/payment"];

const isProtected = (pathname: string) =>
  PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

const toLogin = (request: NextRequest) => {
  const url = new URL("/auth/login", request.url);
  url.searchParams.set(
    "redirect",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );

  const response = NextResponse.redirect(url);
  response.cookies.delete(ACCESS_COOKIE);
  response.cookies.delete(REFRESH_COOKIE);

  return response;
};

export const proxy = async (request: NextRequest) => {
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  const guarded = isProtected(request.nextUrl.pathname);

  if (!refreshToken) {
    return guarded && !accessToken ? toLogin(request) : NextResponse.next();
  }

  const needsRefresh =
    !accessToken || isExpiringWithin(accessToken, REFRESH_SKEW_SECONDS);

  if (!needsRefresh) {
    return NextResponse.next();
  }

  const baseUrl = process.env.API_BASE_URL?.replace(/\/$/, "");

  if (!baseUrl) {
    return NextResponse.next();
  }

  let upstream: Response;

  try {
    upstream = await fetch(`${baseUrl}/api/auth/refresh`, {
      method: "POST",
      headers: { Cookie: `refreshToken=${refreshToken}` },
    });
  } catch {
    return NextResponse.next();
  }

  if (!upstream.ok) {
    if (guarded) {
      return toLogin(request);
    }

    const response = NextResponse.next();
    response.cookies.delete(ACCESS_COOKIE);
    response.cookies.delete(REFRESH_COOKIE);

    return response;
  }

  const nextAccess = readSetCookie(upstream, "accessToken");
  const nextRefresh = readSetCookie(upstream, "refreshToken") ?? refreshToken;

  if (!nextAccess) {
    return NextResponse.next();
  }

  const response = NextResponse.next({
    request: { headers: requestWithTokens(request, nextAccess, nextRefresh) },
  });

  response.cookies.set(ACCESS_COOKIE, nextAccess, {
    ...cookieOptions,
    maxAge: accessCookieMaxAge(nextAccess),
  });
  response.cookies.set(REFRESH_COOKIE, nextRefresh, {
    ...cookieOptions,
    maxAge: refreshCookieMaxAge(nextRefresh),
  });

  return response;
};

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.[\\w]+$).*)"],
};
