import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CalendarClock,
  CalendarX,
  MapPin,
  SearchX,
  ServerCrash,
  Star,
  UserRound,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import BookingStatusBadge from "@/components/booking-status-badge";
import PaymentStatusChip from "@/components/payment-status-chip";
import BookingFilters from "./booking-filters";
import { apiRequest } from "@/lib/api-client";
import { getCurrentUser } from "@/lib/dal";
import { getSessionToken } from "@/lib/session";
import { deriveBookingStatus } from "@/lib/booking-status";
import { formatPrice } from "@/lib/format";
import { visualForCategory } from "@/lib/category-visuals";
import type { AdminBookingListItem } from "@/lib/types";

export const metadata: Metadata = {
  title: "All bookings",
  description: "Every booking made on FixItNow.",
};

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const first = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value)?.trim() ?? "";

const AdminBookingsPage = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const viewer = await getCurrentUser();

  if (!viewer) {
    redirect("/login?redirect=/dashboard/admin/bookings");
  }

  if (viewer.role !== "admin") {
    redirect(`/dashboard/${viewer.role}`);
  }

  const params = await searchParams;
  const q = first(params.q).toLowerCase();
  const statusFilter = [
    "pending",
    "accept",
    "in_progress",
    "complete",
    "decline",
  ].includes(first(params.status))
    ? first(params.status)
    : "";
  const paymentFilter = ["completed", "pending", "none"].includes(
    first(params.payment),
  )
    ? first(params.payment)
    : "";

  let bookings: AdminBookingListItem[];

  try {
    bookings =
      (await apiRequest<AdminBookingListItem[]>("/api/admin/bookings", {
        token: await getSessionToken(),
        cache: "no-store",
      })) ?? [];
  } catch {
    return (
      <div className="space-y-8">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            All bookings
          </h1>
        </header>
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-16 text-center">
          <ServerCrash className="size-8 text-muted-foreground" />
          <p className="font-medium">Could not load bookings</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            The server is not responding. Please refresh to try again.
          </p>
        </div>
      </div>
    );
  }

  const visible = bookings.filter((booking) => {
    if (statusFilter && booking.status !== statusFilter) return false;

    if (paymentFilter === "none" && booking.payment) return false;
    if (
      paymentFilter &&
      paymentFilter !== "none" &&
      booking.payment?.status !== paymentFilter
    ) {
      return false;
    }

    if (
      q &&
      !booking.service.title.toLowerCase().includes(q) &&
      !booking.user.name.toLowerCase().includes(q) &&
      !booking.technician.user.name.toLowerCase().includes(q)
    ) {
      return false;
    }

    return true;
  });

  const revenue = bookings.reduce(
    (sum, booking) =>
      booking.payment?.status === "completed"
        ? sum + Number(booking.payment.amount)
        : sum,
    0,
  );

  const stats = [
    { label: "Bookings", value: String(bookings.length) },
    {
      label: "Active",
      value: String(
        bookings.filter((booking) =>
          ["pending", "accept", "in_progress"].includes(booking.status),
        ).length,
      ),
    },
    {
      label: "Completed",
      value: String(
        bookings.filter((booking) => booking.status === "complete").length,
      ),
    },
    { label: "Revenue", value: formatPrice(revenue) ?? "$0.00" },
  ];

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          All bookings
        </h1>
        <p className="text-sm text-muted-foreground">
          Every booking on the platform, newest first.
        </p>
      </header>

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

      <BookingFilters
        q={first(params.q)}
        status={statusFilter}
        payment={paymentFilter}
      />

      {bookings.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-16 text-center">
          <CalendarX className="size-8 text-muted-foreground" />
          <p className="font-medium">No bookings yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Bookings will appear here as customers book technicians.
          </p>
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-16 text-center">
          <SearchX className="size-8 text-muted-foreground" />
          <p className="font-medium">No bookings match your filters</p>
          <Button asChild variant="outline" size="sm" className="mt-1">
            <Link href="/dashboard/admin/bookings">Clear filters</Link>
          </Button>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">{visible.length}</span>{" "}
            of {bookings.length}
          </p>

          <ul className="space-y-4">
            {visible.map((booking) => {
              const derived = deriveBookingStatus(
                booking.status,
                booking.payment?.status,
              );
              const { icon: Icon, tint } = visualForCategory(
                booking.service.category.name,
              );

              return (
                <li key={booking.id} className="rounded-2xl border bg-card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <span
                        className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${tint}`}
                      >
                        <Icon className="size-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-muted-foreground">
                          {booking.service.category.name}
                        </p>
                        <h2 className="font-semibold leading-snug tracking-tight text-balance">
                          {booking.service.title}
                        </h2>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <span className="text-lg font-semibold tracking-tight">
                        {formatPrice(booking.service.price)}
                      </span>
                      <BookingStatusBadge status={derived} />
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <PaymentStatusChip payment={booking.payment} />
                    {booking.review.length > 0 && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-2.5 py-1 text-xs font-medium text-brand">
                        <Star className="size-3 fill-brand text-brand" />
                        Reviewed {booking.review[0].rating}/5
                      </span>
                    )}
                  </div>

                  <dl className="mt-4 grid gap-x-6 gap-y-2 border-t pt-4 text-sm sm:grid-cols-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <UserRound className="size-3.5 shrink-0" />
                      <dt className="sr-only">Customer</dt>
                      <dd className="truncate text-foreground">
                        {booking.user.name}
                      </dd>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Wrench className="size-3.5 shrink-0" />
                      <dt className="sr-only">Technician</dt>
                      <dd className="truncate text-foreground">
                        {booking.technician.user.name}
                      </dd>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CalendarClock className="size-3.5 shrink-0" />
                      <dt className="sr-only">Scheduled</dt>
                      <dd className="truncate text-foreground">
                        {dateTimeFormatter.format(new Date(booking.scheduled_at))}
                      </dd>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="size-3.5 shrink-0" />
                      <dt className="sr-only">Address</dt>
                      <dd className="truncate text-foreground">
                        {booking.address}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-4 flex justify-end">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/dashboard/admin/bookings/${booking.id}`}>
                        Details
                      </Link>
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
};

export default AdminBookingsPage;
