import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  CircleCheck,
  Info,
  Lock,
  MapPin,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import BookingStatusBadge from "@/components/booking-status-badge";
import PayButton from "@/components/pay-button";
import { ApiError, apiRequest } from "@/lib/api-client";
import { getCurrentUser } from "@/lib/dal";
import { getSessionToken } from "@/lib/session";
import { deriveBookingStatus, STATUS_META } from "@/lib/booking-status";
import { formatPrice } from "@/lib/format";
import { visualForCategory } from "@/lib/category-visuals";
import type { BookingDetail } from "@/lib/types";

export const metadata: Metadata = {
  title: "Pay for booking",
};

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const PayPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/auth/login?redirect=/dashboard/customer/bookings/${id}/pay`);
  }

  if (user.role === "admin") {
    redirect("/dashboard/admin");
  }

  let booking: BookingDetail | undefined;

  try {
    booking = await apiRequest<BookingDetail>(`/api/bookings/${id}`, {
      token: await getSessionToken(),
      cache: "no-store",
    });
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.status === 404 || error.status === 403)
    ) {
      notFound();
    }

    throw error;
  }

  if (!booking) {
    notFound();
  }

  const derived = deriveBookingStatus(booking.status, booking.payment?.status);
  const price = formatPrice(booking.service.price);
  const { icon: Icon, tint } = visualForCategory(booking.service.category.name);
  const isPaid = derived === "paid";
  const canPay = derived === "accepted";

  return (
    <div className="space-y-8">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="-ml-2 text-muted-foreground"
      >
        <Link href={`/dashboard/customer/bookings/${booking.id}`}>
          <ArrowLeft />
          Back to booking
        </Link>
      </Button>

      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {isPaid ? "Payment complete" : "Complete your payment"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isPaid
            ? "This booking is fully paid. Nothing more to do."
            : "Pay securely through Stripe. You are only charged once."}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_18rem] lg:gap-8">
        <section className="space-y-5 rounded-2xl border bg-card p-6">
          <div className="flex items-start gap-3">
            <span
              className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${tint}`}
            >
              <Icon className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-muted-foreground">
                {booking.service.category.name}
              </p>
              <h2 className="font-semibold leading-snug tracking-tight text-balance">
                {booking.service.title}
              </h2>
            </div>
            <BookingStatusBadge status={derived} />
          </div>

          <Separator />

          <dl className="space-y-4 text-sm">
            <div className="flex gap-3">
              <UserRound className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <dt className="text-xs text-muted-foreground">Technician</dt>
                <dd className="font-medium">{booking.technician.user.name}</dd>
              </div>
            </div>
            <div className="flex gap-3">
              <CalendarClock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <dt className="text-xs text-muted-foreground">Scheduled for</dt>
                <dd className="font-medium">
                  {dateTimeFormatter.format(new Date(booking.scheduled_at))}
                </dd>
              </div>
            </div>
            <div className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <dt className="text-xs text-muted-foreground">Address</dt>
                <dd className="font-medium break-words">{booking.address}</dd>
              </div>
            </div>
          </dl>
        </section>

        <aside className="space-y-5 rounded-2xl border bg-card p-6 lg:h-fit">
          <div>
            <p className="text-sm text-muted-foreground">Amount due</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight">
              {price ?? "—"}
            </p>
          </div>

          {isPaid ? (
            <div className="space-y-3">
              <p className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                <CircleCheck className="size-4" />
                Paid
              </p>
              {booking.payment?.paid_at && (
                <p className="text-xs text-muted-foreground">
                  Paid on{" "}
                  {new Intl.DateTimeFormat("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }).format(new Date(booking.payment.paid_at))}
                </p>
              )}
              <Button asChild variant="outline" className="w-full">
                <Link href={`/dashboard/customer/bookings/${booking.id}`}>
                  View booking
                </Link>
              </Button>
            </div>
          ) : canPay ? (
            <div className="space-y-3">
              <PayButton
                bookingId={booking.id}
                size="lg"
                className="w-full"
                label={`Pay ${price ?? ""}`.trim()}
              />
              <p className="flex items-start gap-2 text-xs text-muted-foreground">
                <Lock className="mt-0.5 size-3 shrink-0" />
                You will be redirected to Stripe. Card details never touch
                FixItNow.
              </p>
            </div>
          ) : (
            <p className="flex items-start gap-2 rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
              <Info className="mt-0.5 size-3.5 shrink-0" />
              {STATUS_META[derived].description} Payment opens once the
              technician accepts your request.
            </p>
          )}

          <p className="flex items-start gap-2 border-t pt-4 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
            Payment is confirmed by Stripe, so it may take a moment to appear
            after checkout.
          </p>
        </aside>
      </div>
    </div>
  );
};

export default PayPage;
