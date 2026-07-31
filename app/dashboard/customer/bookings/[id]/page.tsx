import type { Metadata } from "next";
import Link from "@/components/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  Check,
  Circle,
  CircleCheck,
  CreditCard,
  Hash,
  Mail,
  MapPin,
  Phone,
  Receipt,
  Star,
  StickyNote,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import BookingStatusBadge from "@/components/booking-status-badge";
import CancelBookingButton from "@/components/cancel-booking-button";
import ReviewDialog from "@/components/review-dialog";
import { ApiError, apiRequest } from "@/lib/api-client";
import { getCurrentUser } from "@/lib/dal";
import { getSessionToken } from "@/lib/session";
import {
  STATUS_META,
  STATUS_ORDER,
  deriveBookingStatus,
  isCancellable,
} from "@/lib/booking-status";
import { formatPrice, initialsOf } from "@/lib/format";
import { visualForCategory } from "@/lib/category-visuals";
import type { BookingDetail } from "@/lib/types";

export const metadata: Metadata = {
  title: "Booking details",
};

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const Row = ({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof MapPin;
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex gap-3">
    <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
    <div className="min-w-0 space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="text-sm font-medium break-words">{children}</div>
    </div>
  </div>
);

const BookingDetailPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/auth/login?redirect=/dashboard/customer/bookings/${id}`);
  }

  const token = await getSessionToken();
  let booking: BookingDetail | undefined;

  try {
    booking = await apiRequest<BookingDetail>(`/api/bookings/${id}`, {
      token,
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
  const meta = STATUS_META[derived];
  const { icon: Icon, tint } = visualForCategory(booking.service.category.name);
  const price = formatPrice(booking.service.price);
  const isDeadEnd = derived === "declined" || derived === "cancelled";
  const timelineIndex = STATUS_ORDER.indexOf(derived);
  const canReview =
    derived === "completed" && booking.payment?.status === "completed";

  return (
    <div className="space-y-8">
      <div>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="-ml-2 text-muted-foreground"
        >
          <Link href="/dashboard/customer/bookings">
            <ArrowLeft />
            Back to my bookings
          </Link>
        </Button>
      </div>

      <header className="space-y-4">
        <div className="flex items-start gap-3">
          <span
            className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${tint}`}
          >
            <Icon className="size-6" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-muted-foreground">
              {booking.service.category.name}
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
              {booking.service.title}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <BookingStatusBadge status={derived} />
          <p className="text-sm text-muted-foreground">{meta.description}</p>
        </div>
      </header>

      {!isDeadEnd && (
        <section className="rounded-2xl border bg-card p-6">
          <h2 className="mb-5 font-semibold tracking-tight">Progress</h2>
          <ol className="grid gap-4 sm:grid-cols-5">
            {STATUS_ORDER.map((step, index) => {
              const reached = index <= timelineIndex;

              return (
                <li key={step} className="flex items-center gap-2 sm:flex-col sm:items-start">
                  <span
                    className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                      reached
                        ? "bg-brand text-brand-foreground"
                        : "border-2 border-dashed border-border text-muted-foreground"
                    }`}
                  >
                    {reached ? (
                      <Check className="size-3" strokeWidth={3} />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span
                    className={`text-xs ${reached ? "font-medium" : "text-muted-foreground"}`}
                  >
                    {STATUS_META[step].label}
                  </span>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_18rem] lg:gap-8">
        <div className="space-y-6">
          <section className="space-y-5 rounded-2xl border bg-card p-6">
            <h2 className="font-semibold tracking-tight">Booking details</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <Row icon={CalendarClock} label="Scheduled for">
                {dateTimeFormatter.format(new Date(booking.scheduled_at))}
              </Row>
              <Row icon={Receipt} label="Requested on">
                {dateFormatter.format(new Date(booking.created_at))}
              </Row>
              <div className="sm:col-span-2">
                <Row icon={MapPin} label="Service address">
                  {booking.address}
                </Row>
              </div>
              {booking.note && (
                <div className="sm:col-span-2">
                  <Row icon={StickyNote} label="Your note">
                    {booking.note}
                  </Row>
                </div>
              )}
              <div className="sm:col-span-2">
                <Row icon={Hash} label="Booking reference">
                  <span className="font-mono text-xs">{booking.id}</span>
                </Row>
              </div>
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border bg-card p-6">
            <h2 className="font-semibold tracking-tight">Technician</h2>
            <div className="flex items-center gap-3">
              <Avatar className="size-11">
                <AvatarFallback className="bg-brand/12 font-medium text-brand">
                  {initialsOf(booking.technician.user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {booking.technician.user.name}
                </p>
                {booking.technician.experience_year !== null && (
                  <p className="text-sm text-muted-foreground">
                    {booking.technician.experience_year} years experience
                  </p>
                )}
              </div>
            </div>

            {booking.technician.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {booking.technician.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            )}

            <div className="grid gap-4 border-t pt-4 sm:grid-cols-2">
              <Row icon={Mail} label="Email">
                {booking.technician.user.email}
              </Row>
              {booking.technician.user.phone_no && (
                <Row icon={Phone} label="Phone">
                  {booking.technician.user.phone_no}
                </Row>
              )}
            </div>

            <Button asChild variant="outline" size="sm">
              <Link href={`/technicians/${booking.technician_id}`}>
                View technician profile
              </Link>
            </Button>
          </section>

          {booking.review.length === 0 && !isDeadEnd && (
            <section className="space-y-4 rounded-2xl border bg-card p-6">
              <div className="space-y-1">
                <h2 className="font-semibold tracking-tight">Leave a review</h2>
                <p className="text-sm text-muted-foreground">
                  {canReview
                    ? "The job is done and paid. Tell other customers how it went."
                    : "You can review once the job is marked completed and your payment has gone through."}
                </p>
              </div>

              {canReview ? (
                <ReviewDialog
                  bookingId={booking.id}
                  serviceTitle={booking.service.title}
                  technicianName={booking.technician.user.name}
                />
              ) : (
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    {derived === "completed" ? (
                      <Check className="size-4 text-emerald-500" />
                    ) : (
                      <Circle className="size-4 text-muted-foreground/40" />
                    )}
                    <span
                      className={
                        derived === "completed"
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }
                    >
                      Job marked completed
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    {booking.payment?.status === "completed" ? (
                      <Check className="size-4 text-emerald-500" />
                    ) : (
                      <Circle className="size-4 text-muted-foreground/40" />
                    )}
                    <span
                      className={
                        booking.payment?.status === "completed"
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }
                    >
                      Payment completed
                    </span>
                  </li>
                </ul>
              )}
            </section>
          )}

          {booking.review.length > 0 && (
            <section className="space-y-4 rounded-2xl border bg-card p-6">
              <h2 className="font-semibold tracking-tight">Your review</h2>
              {booking.review.map((review) => (
                <div key={review.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }, (_, index) => (
                        <Star
                          key={index}
                          className={`size-3.5 ${
                            index < review.rating
                              ? "fill-brand text-brand"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {dateFormatter.format(new Date(review.created_at))}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {review.comment}
                  </p>
                </div>
              ))}
            </section>
          )}
        </div>

        <aside className="space-y-5 rounded-2xl border bg-card p-6 lg:h-fit">
          <div>
            <p className="text-sm text-muted-foreground">Service price</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">
              {price ?? "—"}
            </p>
          </div>

          {derived === "accepted" && (
            <Button
              asChild
              className="w-full bg-brand text-brand-foreground hover:bg-brand/90"
            >
              <Link href={`/dashboard/customer/bookings/${booking.id}/pay`}>
                <CreditCard />
                Pay now
              </Link>
            </Button>
          )}

          {derived === "paid" && (
            <p className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              <CircleCheck className="size-4" />
              Paid
            </p>
          )}

          {isCancellable(booking.status) && (
            <div className="space-y-2">
              <CancelBookingButton
                bookingId={booking.id}
                serviceTitle={booking.service.title}
                size="default"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                You can cancel free of charge until the technician accepts.
              </p>
            </div>
          )}

          <Separator />

          <div className="space-y-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <CreditCard className="size-4 text-brand" />
              Payment
            </h2>

            {booking.payment ? (
              <dl className="space-y-3 text-sm">
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd className="font-medium capitalize">
                    {booking.payment.status}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-muted-foreground">Amount</dt>
                  <dd className="font-medium">
                    {formatPrice(booking.payment.amount) ?? "—"}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-muted-foreground">Method</dt>
                  <dd className="font-medium capitalize">
                    {booking.payment.method}
                  </dd>
                </div>
                {booking.payment.paid_at && (
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-muted-foreground">Paid on</dt>
                    <dd className="text-right font-medium">
                      {dateFormatter.format(new Date(booking.payment.paid_at))}
                    </dd>
                  </div>
                )}
                <div className="space-y-1 border-t pt-3">
                  <dt className="text-muted-foreground">Transaction</dt>
                  <dd className="font-mono text-[0.7rem] break-all">
                    {booking.payment.transaction_id}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">
                {derived === "cancelled"
                  ? "You cancelled this booking, so nothing was charged."
                  : derived === "requested"
                    ? "Payment opens once the technician accepts your request."
                    : "No payment has been started for this booking yet."}
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default BookingDetailPage;
