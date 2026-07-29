import Link from "next/link";
import {
  CalendarClock,
  CalendarX,
  CircleCheck,
  CreditCard,
  MapPin,
  ServerCrash,
  Star,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import BookingStatusBadge from "@/components/booking-status-badge";
import CancelBookingButton from "@/components/cancel-booking-button";
import ReviewDialog from "@/components/review-dialog";
import { apiRequest } from "@/lib/api-client";
import { getSessionToken } from "@/lib/session";
import { deriveBookingStatus, isCancellable } from "@/lib/booking-status";
import { formatPrice } from "@/lib/format";
import { visualForCategory } from "@/lib/category-visuals";
import type { BookingListItem } from "@/lib/types";

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const CustomerBookings = async () => {
  let bookings: BookingListItem[];

  try {
    bookings =
      (await apiRequest<BookingListItem[]>("/api/bookings", {
        token: await getSessionToken(),
        cache: "no-store",
      })) ?? [];
  } catch {
    return (
      <div className="space-y-8">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            My bookings
          </h1>
        </header>
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-16 text-center">
          <ServerCrash className="size-8 text-muted-foreground" />
          <p className="font-medium">Could not load your bookings</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            The server is not responding. Please refresh to try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            My bookings
          </h1>
          <p className="text-sm text-muted-foreground">
            {bookings.length === 0
              ? "You have not booked any services yet."
              : `${bookings.length} ${bookings.length === 1 ? "booking" : "bookings"} you requested, newest first.`}
          </p>
        </div>
        {bookings.length > 0 && (
          <Button asChild variant="outline" size="sm">
            <Link href="/services">Book another service</Link>
          </Button>
        )}
      </header>

      {bookings.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-16 text-center">
          <CalendarX className="size-8 text-muted-foreground" />
          <p className="font-medium">No bookings yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            When you book a technician, your request will show up here so you
            can track it from request to receipt.
          </p>
          <Button
            asChild
            className="mt-1 bg-brand text-brand-foreground hover:bg-brand/90"
          >
            <Link href="/services">Browse services</Link>
          </Button>
        </div>
      ) : (
        <ul className="space-y-4">
          {bookings.map((booking) => {
            const derived = deriveBookingStatus(
              booking.status,
              booking.payment?.status,
            );
            const { icon: Icon, tint } = visualForCategory(
              booking.service.category.name,
            );
            const price = formatPrice(booking.service.price);

            return (
              <li
                key={booking.id}
                className="rounded-2xl border bg-card p-5 transition-colors hover:border-brand/40"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <span
                    className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${tint}`}
                  >
                    <Icon className="size-5" />
                  </span>

                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-muted-foreground">
                          {booking.service.category.name}
                        </p>
                        <h2 className="font-semibold leading-snug tracking-tight text-balance">
                          {booking.service.title}
                        </h2>
                      </div>
                      <BookingStatusBadge status={derived} />
                    </div>

                    <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CalendarClock className="size-3.5 shrink-0" />
                        <dt className="sr-only">Scheduled</dt>
                        <dd className="truncate text-foreground">
                          {dateTimeFormatter.format(
                            new Date(booking.scheduled_at),
                          )}
                        </dd>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <UserRound className="size-3.5 shrink-0" />
                        <dt className="sr-only">Technician</dt>
                        <dd className="truncate text-foreground">
                          {booking.technician.user.name}
                        </dd>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground sm:col-span-2">
                        <MapPin className="size-3.5 shrink-0" />
                        <dt className="sr-only">Address</dt>
                        <dd className="truncate text-foreground">
                          {booking.address}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="flex items-center justify-between gap-3 border-t pt-4 sm:w-44 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
                    {price && (
                      <span className="text-lg font-semibold tracking-tight">
                        {price}
                      </span>
                    )}

                    {derived === "paid" && (
                      <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        <CircleCheck className="size-4" />
                        Paid
                      </span>
                    )}

                    {booking.review.length > 0 && (
                      <span className="flex items-center gap-1 text-sm font-medium text-brand">
                        <Star className="size-3.5 fill-brand text-brand" />
                        {booking.review[0].rating}/5
                      </span>
                    )}

                    <div className="flex flex-wrap justify-end gap-2">
                      {derived === "completed" &&
                        booking.payment?.status === "completed" &&
                        booking.review.length === 0 && (
                          <ReviewDialog
                            bookingId={booking.id}
                            serviceTitle={booking.service.title}
                            technicianName={booking.technician.user.name}
                          />
                        )}
                      {derived === "accepted" && (
                        <Button
                          asChild
                          size="sm"
                          className="bg-brand text-brand-foreground hover:bg-brand/90"
                        >
                          <Link
                            href={`/dashboard/customer/bookings/${booking.id}/pay`}
                          >
                            <CreditCard />
                            Pay now
                          </Link>
                        </Button>
                      )}
                      {isCancellable(booking.status) && (
                        <CancelBookingButton
                          bookingId={booking.id}
                          serviceTitle={booking.service.title}
                        />
                      )}
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/customer/bookings/${booking.id}`}>
                          Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default CustomerBookings;
