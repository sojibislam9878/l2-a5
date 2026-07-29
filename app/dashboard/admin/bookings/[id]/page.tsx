import type { Metadata } from "next";
import Link from "@/components/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarClock,
  Check,
  CircleSlash,
  CreditCard,
  Hash,
  Mail,
  MapPin,
  Phone,
  Receipt,
  Star,
  StickyNote,
  UserRound,
  Wrench,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import BookingStatusBadge from "@/components/booking-status-badge";
import PaymentStatusChip from "@/components/payment-status-chip";
import { ApiError, apiRequest } from "@/lib/api-client";
import { getCurrentUser } from "@/lib/dal";
import { getSessionToken } from "@/lib/session";
import {
  STATUS_META,
  STATUS_ORDER,
  deriveBookingStatus,
} from "@/lib/booking-status";
import { formatPrice, initialsOf } from "@/lib/format";
import { visualForCategory } from "@/lib/category-visuals";
import type { AdminBookingDetail } from "@/lib/types";

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

const Party = ({
  heading,
  name,
  email,
  phone,
  banned,
  href,
  hrefLabel,
  extra,
}: {
  heading: string;
  name: string;
  email: string;
  phone: string | null;
  banned: boolean;
  href: string;
  hrefLabel: string;
  extra?: React.ReactNode;
}) => (
  <section className="space-y-4 rounded-2xl border bg-card p-6">
    <h2 className="font-semibold tracking-tight">{heading}</h2>

    <div className="flex items-center gap-3">
      <Avatar className="size-11">
        <AvatarFallback className="bg-brand/12 font-medium text-brand">
          {initialsOf(name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{name}</p>
        {extra}
      </div>
      {banned && (
        <Badge variant="secondary" className="bg-destructive/10 text-destructive">
          <CircleSlash className="size-3" />
          Banned
        </Badge>
      )}
    </div>

    <div className="grid gap-4 border-t pt-4 sm:grid-cols-2">
      <Row icon={Mail} label="Email">
        {email}
      </Row>
      {phone && (
        <Row icon={Phone} label="Phone">
          {phone}
        </Row>
      )}
    </div>

    <Button asChild variant="outline" size="sm">
      <Link href={href}>
        {hrefLabel}
        <ArrowUpRight />
      </Link>
    </Button>
  </section>
);

const AdminBookingDetailPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const viewer = await getCurrentUser();

  if (!viewer) {
    redirect(`/auth/login?redirect=/dashboard/admin/bookings/${id}`);
  }

  if (viewer.role !== "admin") {
    redirect(`/dashboard/${viewer.role}`);
  }

  let booking: AdminBookingDetail | undefined;

  try {
    booking = await apiRequest<AdminBookingDetail>(
      `/api/admin/bookings/${id}`,
      { token: await getSessionToken(), cache: "no-store" },
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }

  if (!booking) {
    notFound();
  }

  const derived = deriveBookingStatus(booking.status, booking.payment?.status);
  const { icon: Icon, tint } = visualForCategory(booking.service.category.name);
  const isDeclined = derived === "declined";
  const timelineIndex = STATUS_ORDER.indexOf(derived);

  return (
    <div className="space-y-8">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="-ml-2 text-muted-foreground"
      >
        <Link href="/dashboard/admin/bookings">
          <ArrowLeft />
          Back to all bookings
        </Link>
      </Button>

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

        <div className="flex flex-wrap items-center gap-2">
          <BookingStatusBadge status={derived} />
          <PaymentStatusChip payment={booking.payment} />
          {booking.review.length > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-2.5 py-1 text-xs font-medium text-brand">
              <Star className="size-3 fill-brand text-brand" />
              Reviewed {booking.review[0].rating}/5
            </span>
          )}
          <p className="text-sm text-muted-foreground">
            {STATUS_META[derived].description}
          </p>
        </div>
      </header>

      {!isDeclined && (
        <section className="rounded-2xl border bg-card p-6">
          <h2 className="mb-5 font-semibold tracking-tight">Progress</h2>
          <ol className="grid gap-4 sm:grid-cols-5">
            {STATUS_ORDER.map((step, index) => {
              const reached = index <= timelineIndex;

              return (
                <li
                  key={step}
                  className="flex items-center gap-2 sm:flex-col sm:items-start"
                >
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

      <div className="grid gap-6 lg:grid-cols-[1fr_19rem] lg:gap-8">
        <div className="min-w-0 space-y-6">
          <section className="space-y-5 rounded-2xl border bg-card p-6">
            <h2 className="font-semibold tracking-tight">Booking</h2>
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
                  <Row icon={StickyNote} label="Customer note">
                    {booking.note}
                  </Row>
                </div>
              )}
              <div className="sm:col-span-2">
                <Row icon={Hash} label="Booking id">
                  <span className="font-mono text-xs">{booking.id}</span>
                </Row>
              </div>
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border bg-card p-6">
            <h2 className="font-semibold tracking-tight">Service</h2>
            <div className="space-y-1">
              <p className="font-medium">{booking.service.title}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {booking.service.description}
              </p>
            </div>
            <dl className="grid gap-4 border-t pt-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">Price</dt>
                <dd className="font-medium">
                  {formatPrice(booking.service.price)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Category</dt>
                <dd className="font-medium">{booking.service.category.name}</dd>
              </div>
            </dl>
            <Button asChild variant="outline" size="sm">
              <Link href={`/services/${booking.service.id}`}>
                View public page
                <ArrowUpRight />
              </Link>
            </Button>
          </section>

          <Party
            heading="Customer"
            name={booking.user.name}
            email={booking.user.email}
            phone={booking.user.phone_no}
            banned={booking.user.status === "ban"}
            href={`/dashboard/admin/users/${booking.user.id}`}
            hrefLabel="View user"
            extra={
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <UserRound className="size-3" />
                Joined {dateFormatter.format(new Date(booking.user.createdAt))}
              </p>
            }
          />

          <Party
            heading="Technician"
            name={booking.technician.user.name}
            email={booking.technician.user.email}
            phone={booking.technician.user.phone_no}
            banned={booking.technician.user.status === "ban"}
            href={`/dashboard/admin/users/${booking.technician.user_id}`}
            hrefLabel="View user"
            extra={
              <p className="flex flex-wrap items-center gap-x-3 text-sm text-muted-foreground">
                {booking.technician.experience_year !== null && (
                  <span className="flex items-center gap-1.5">
                    <Wrench className="size-3" />
                    {booking.technician.experience_year} yrs
                  </span>
                )}
                {booking.technician.hourly_rate && (
                  <span>{formatPrice(booking.technician.hourly_rate)}/hr</span>
                )}
              </p>
            }
          />

          {booking.review.length > 0 && (
            <section className="space-y-4 rounded-2xl border bg-card p-6">
              <h2 className="font-semibold tracking-tight">Review</h2>
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

        <aside className="space-y-5 rounded-2xl border bg-card p-6 lg:sticky lg:top-24 lg:h-fit">
          <div>
            <p className="text-sm text-muted-foreground">Service price</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">
              {formatPrice(booking.service.price) ?? "—"}
            </p>
          </div>

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
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-muted-foreground">Started</dt>
                  <dd className="text-right font-medium">
                    {dateFormatter.format(new Date(booking.payment.created_at))}
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
                No payment has been started for this booking.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AdminBookingDetailPage;
