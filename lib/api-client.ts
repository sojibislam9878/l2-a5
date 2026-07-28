import "server-only";

import { env } from "./env";
import type { ApiSuccess } from "./types";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string;
  cache?: RequestCache;
  revalidate?: number | false;
  tags?: string[];
};

const readMessage = (payload: unknown, status: number) => {
  if (payload && typeof payload === "object" && "message" in payload) {
    const { message } = payload as { message?: unknown };
    if (typeof message === "string" && message.length > 0) {
      return message;
    }
  }

  return `Request failed with status ${status}`;
};

export const apiRequest = async <T>(
  path: string,
  options: RequestOptions = {},
): Promise<T | undefined> => {
  const { method = "GET", body, token, cache, revalidate, tags } = options;

  let response: Response;

  try {
    response = await fetch(`${env.apiBaseUrl}${path}`, {
      method,
      headers: {
        ...(body !== undefined && { "Content-Type": "application/json" }),
        ...(token && { Cookie: `accessToken=${token}` }),
      },
      ...(body !== undefined && { body: JSON.stringify(body) }),
      ...(cache && { cache }),
      ...((revalidate !== undefined || tags) && {
        next: {
          ...(revalidate !== undefined && { revalidate }),
          ...(tags && { tags }),
        },
      }),
    });
  } catch {
    throw new ApiError(503, "Cannot reach the server. Please try again.");
  }

  const text = await response.text();
  let payload: unknown;

  try {
    payload = text ? JSON.parse(text) : undefined;
  } catch {
    throw new ApiError(response.status, "Received an invalid response.");
  }

  if (!response.ok) {
    throw new ApiError(response.status, readMessage(payload, response.status));
  }

  return (payload as ApiSuccess<T>)?.data;
};
