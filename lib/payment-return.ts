import "server-only";

import { apiRequest } from "@/lib/api-client";
import { getSessionToken } from "@/lib/session";
import type { PaymentListItem } from "@/lib/types";

export const findOwnPaymentBySession = async (
  sessionId: string | undefined,
) => {
  if (!sessionId) return null;

  const token = await getSessionToken();

  if (!token) return null;

  const payments = await apiRequest<PaymentListItem[]>("/api/payments", {
    token,
    cache: "no-store",
  }).catch(() => null);

  return (
    payments?.find((payment) => payment.transaction_id === sessionId) ?? null
  );
};
