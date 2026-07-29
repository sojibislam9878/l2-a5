import { CircleCheck, CircleSlash, Clock, CreditCard } from "lucide-react";
import { formatPrice } from "@/lib/format";
import type { PaymentStatus } from "@/lib/types";

type PaymentInfo = {
  status: PaymentStatus;
  amount: string;
  paid_at: string | null;
} | null;

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const PaymentStatusChip = ({ payment }: { payment: PaymentInfo }) => {
  if (!payment) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
        <CreditCard className="size-3" />
        Not paid
      </span>
    );
  }

  if (payment.status === "completed") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-500/12 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
        <CircleCheck className="size-3" />
        Paid {formatPrice(payment.amount)}
        {payment.paid_at && (
          <span className="font-normal opacity-80">
            · {dateFormatter.format(new Date(payment.paid_at))}
          </span>
        )}
      </span>
    );
  }

  if (payment.status === "failed") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-destructive/12 px-2.5 py-1 text-xs font-medium text-destructive">
        <CircleSlash className="size-3" />
        Payment failed
      </span>
    );
  }

  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-amber-500/12 px-2.5 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
      <Clock className="size-3" />
      Payment pending
    </span>
  );
};

export default PaymentStatusChip;
