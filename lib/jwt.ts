export const decodeTokenExpiry = (token: string) => {
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

export const secondsUntilExpiry = (token: string) => {
  const expiry = decodeTokenExpiry(token);

  return expiry === undefined
    ? undefined
    : expiry - Math.floor(Date.now() / 1000);
};

export const isExpiringWithin = (token: string, skewSeconds: number) => {
  const remaining = secondsUntilExpiry(token);

  return remaining === undefined ? false : remaining <= skewSeconds;
};
