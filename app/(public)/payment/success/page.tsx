import type { Metadata } from "next";
import Link from "@/components/link";
import { notFound } from "next/navigation";
import { CircleCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { findOwnPaymentBySession } from "@/lib/payment-return";

export const metadata: Metadata = {
  title: "Payment successful",
  description: "Your FixItNow payment went through.",
};

const PaymentSuccessPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) => {
  const { session_id } = await searchParams;
  const payment = await findOwnPaymentBySession(session_id);

  if (!payment) {
    notFound();
  }

  const settled = payment.status === "completed";

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-5 px-4 py-20 text-center sm:px-6">
      <span className="flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
        <CircleCheck className="size-7" />
      </span>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Payment successful
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Thanks! Your technician has been notified and will arrive at the
          scheduled time.
        </p>
      </div>

      <dl className="w-full space-y-2.5 rounded-xl border bg-card p-4 text-left text-sm">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="shrink-0 text-muted-foreground">Service</dt>
          <dd className="min-w-0 truncate font-medium">
            {payment.booking.service.title}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="shrink-0 text-muted-foreground">Technician</dt>
          <dd className="min-w-0 truncate font-medium">
            {payment.booking.technician.user.name}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3 border-t pt-2.5">
          <dt className="shrink-0 text-muted-foreground">Amount paid</dt>
          <dd className="text-base font-semibold tracking-tight">
            {formatPrice(payment.amount) ?? "—"}
          </dd>
        </div>
      </dl>

      {!settled && (
        <p className="flex items-start gap-2 rounded-xl border border-dashed p-3 text-xs text-muted-foreground">
          <Clock className="mt-0.5 size-3.5 shrink-0" />
          Stripe confirms payments by webhook, so your booking may take a few
          seconds to show as paid.
        </p>
      )}

      <div className="flex w-full flex-col gap-2 sm:flex-row">
        <Button
          asChild
          className="flex-1 bg-brand text-brand-foreground hover:bg-brand/90"
        >
          <Link href={`/dashboard/customer/bookings/${payment.booking_id}`}>
            View booking
          </Link>
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <Link href="/dashboard/customer/payments">My payments</Link>
        </Button>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
