import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowUpRight,
  CalendarClock,
  Receipt,
  ServerCrash,
  UserRound,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PaymentStatusChip from "@/components/payment-status-chip";
import { apiRequest } from "@/lib/api-client";
import { getCurrentUser } from "@/lib/dal";
import { getSessionToken } from "@/lib/session";
import { formatPrice } from "@/lib/format";
import { visualForCategory } from "@/lib/category-visuals";
import type { PaymentListItem } from "@/lib/types";

export const metadata: Metadata = {
  title: "My payments",
  description: "Every payment you have made on FixItNow.",
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const PaymentsPage = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login?redirect=/dashboard/customer/payments");
  }

  if (user.role === "admin") {
    redirect("/dashboard/admin");
  }

  let payments: PaymentListItem[];

  try {
    payments =
      (await apiRequest<PaymentListItem[]>("/api/payments", {
        token: await getSessionToken(),
        cache: "no-store",
      })) ?? [];
  } catch {
    return (
      <div className="space-y-8">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            My payments
          </h1>
        </header>
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-16 text-center">
          <ServerCrash className="size-8 text-muted-foreground" />
          <p className="font-medium">Could not load your payments</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            The server is not responding. Please refresh to try again.
          </p>
        </div>
      </div>
    );
  }

  const totalPaid = payments
    .filter((payment) => payment.status === "completed")
    .reduce((sum, payment) => sum + Number(payment.amount), 0);

  const pendingCount = payments.filter(
    (payment) => payment.status === "pending",
  ).length;
  const failedCount = payments.filter(
    (payment) => payment.status === "failed",
  ).length;

  const stats = [
    { label: "Total paid", value: formatPrice(totalPaid) ?? "$0.00" },
    { label: "Payments", value: String(payments.length) },
    { label: "Pending", value: String(pendingCount) },
    { label: "Failed", value: String(failedCount) },
  ];

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          My payments
        </h1>
        <p className="text-sm text-muted-foreground">
          {payments.length === 0
            ? "You have not made any payments yet."
            : `${payments.length} ${payments.length === 1 ? "payment" : "payments"}, newest first.`}
        </p>
      </header>

      {payments.length > 0 && (
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border bg-card p-4">
              <dt className="text-xs text-muted-foreground">{stat.label}</dt>
              <dd className="mt-1 text-xl font-semibold tracking-tight">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {payments.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-16 text-center">
          <Wallet className="size-8 text-muted-foreground" />
          <p className="font-medium">No payments yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Once a technician accepts a booking and you pay for it, the receipt
            will appear here.
          </p>
          <Button asChild variant="outline" className="mt-1">
            <Link href="/dashboard/customer/bookings">View my bookings</Link>
          </Button>
        </div>
      ) : (
        <ul className="space-y-4">
          {payments.map((payment) => {
            const { icon: Icon, tint } = visualForCategory(
              payment.booking.service.category.name,
            );
            const amount = formatPrice(payment.amount);

            return (
              <li key={payment.id} className="rounded-2xl border bg-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <span
                      className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${tint}`}
                    >
                      <Icon className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-muted-foreground">
                        {payment.booking.service.category.name}
                      </p>
                      <h2 className="font-semibold leading-snug tracking-tight text-balance">
                        {payment.booking.service.title}
                      </h2>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {amount && (
                      <span className="text-lg font-semibold tracking-tight">
                        {amount}
                      </span>
                    )}
                    <PaymentStatusChip payment={payment} />
                  </div>
                </div>

                <dl className="mt-4 grid gap-x-6 gap-y-2 border-t pt-4 text-sm sm:grid-cols-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <UserRound className="size-3.5 shrink-0" />
                    <dt className="sr-only">Technician</dt>
                    <dd className="truncate text-foreground">
                      {payment.booking.technician.user.name}
                    </dd>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarClock className="size-3.5 shrink-0" />
                    <dt className="sr-only">Scheduled</dt>
                    <dd className="truncate text-foreground">
                      {dateTimeFormatter.format(
                        new Date(payment.booking.scheduled_at),
                      )}
                    </dd>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Receipt className="size-3.5 shrink-0" />
                    <dt className="sr-only">
                      {payment.paid_at ? "Paid on" : "Started on"}
                    </dt>
                    <dd className="text-foreground">
                      {payment.paid_at
                        ? `Paid ${dateFormatter.format(new Date(payment.paid_at))}`
                        : `Started ${dateFormatter.format(new Date(payment.created_at))}`}
                      <span className="text-muted-foreground">
                        {" "}
                        · {payment.method}
                      </span>
                    </dd>
                  </div>
                  <div className="flex items-center justify-start gap-2 sm:justify-end">
                    <Button asChild variant="outline" size="sm">
                      <Link
                        href={`/dashboard/customer/bookings/${payment.booking_id}`}
                      >
                        View booking
                        <ArrowUpRight />
                      </Link>
                    </Button>
                  </div>
                </dl>

                <p className="mt-3 font-mono text-[0.7rem] break-all text-muted-foreground">
                  {payment.transaction_id}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default PaymentsPage;
