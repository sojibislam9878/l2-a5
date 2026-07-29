import type { Metadata } from "next";
import Link from "@/components/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  CalendarCheck,
  ClipboardList,
  TriangleAlert,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import BookingStatusBadge from "@/components/booking-status-badge";
import { apiRequest } from "@/lib/api-client";
import { getCurrentUser } from "@/lib/dal";
import { getSessionToken } from "@/lib/session";
import { deriveBookingStatus } from "@/lib/booking-status";
import { formatPrice } from "@/lib/format";
import { groupByDay } from "@/lib/availability";
import type { BookingListItem, TechnicianJob } from "@/lib/types";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your bookings and jobs in one place.",
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const DashboardPage = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login?redirect=/dashboard");
  }

  if (user.role !== "technician") {
    redirect(`/dashboard/${user.role}`);
  }

  const token = await getSessionToken();

  const [bookings, jobs] = await Promise.all([
    apiRequest<BookingListItem[]>("/api/bookings", {
      token,
      cache: "no-store",
    }).catch(() => []),
    apiRequest<TechnicianJob[]>("/api/technician/bookings", {
      token,
      cache: "no-store",
    }).catch(() => []),
  ]);

  const myBookings = bookings ?? [];
  const myJobs = jobs ?? [];

  const earnings = myJobs.reduce(
    (total, job) =>
      job.payment?.status === "completed"
        ? total + Number(job.payment.amount)
        : total,
    0,
  );

  const pending = myJobs.filter((job) => job.status === "pending").length;
  const profile = user.technician_profile;
  const schedule = groupByDay(profile?.availability ?? []);

  const gaps = [
    !profile?.bio && "a bio",
    (profile?.skills.length ?? 0) === 0 && "skills",
    profile?.hourly_rate === null && "an hourly rate",
    schedule.length === 0 && "working hours",
  ].filter(Boolean) as string[];

  const stats = [
    { label: "New requests", value: String(pending) },
    { label: "Jobs received", value: String(myJobs.length) },
    { label: "Bookings made", value: String(myBookings.length) },
    { label: "Earnings", value: formatPrice(earnings) ?? "$0.00" },
  ];

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Welcome back, {user.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          Everything you book and everything you take on, side by side.
        </p>
      </header>

      {gaps.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-brand/30 bg-brand/5 p-4">
          <TriangleAlert className="size-4 shrink-0 text-brand" />
          <p className="flex-1 text-sm">
            Your profile is missing {gaps.join(", ")}. Customers are more likely
            to book a complete profile.
          </p>
          <Button asChild size="sm" variant="outline">
            <Link href="/dashboard/technician/profile">Complete profile</Link>
          </Button>
        </div>
      )}

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

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        <section className="flex flex-col rounded-2xl border bg-card p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h2 className="flex items-center gap-2 font-semibold tracking-tight">
                <ClipboardList className="size-4 text-brand" />
                Job requests
              </h2>
              <p className="text-sm text-muted-foreground">
                Bookings customers made for your services.
              </p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/technician/bookings">
                All
                <ArrowRight />
              </Link>
            </Button>
          </div>

          <ul className="mt-5 flex-1 space-y-3">
            {myJobs.length === 0 ? (
              <li className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                No job requests yet.
              </li>
            ) : (
              myJobs.slice(0, 3).map((job) => (
                <li
                  key={job.id}
                  className="flex items-start justify-between gap-3 border-b pb-3 last:border-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {job.service.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {job.user.name} ·{" "}
                      {dateFormatter.format(new Date(job.scheduled_at))}
                    </p>
                  </div>
                  <BookingStatusBadge
                    status={deriveBookingStatus(
                      job.status,
                      job.payment?.status,
                    )}
                  />
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="flex flex-col rounded-2xl border bg-card p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h2 className="flex items-center gap-2 font-semibold tracking-tight">
                <CalendarCheck className="size-4 text-brand" />
                My bookings
              </h2>
              <p className="text-sm text-muted-foreground">
                Services you booked from other technicians.
              </p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/customer/bookings">
                All
                <ArrowRight />
              </Link>
            </Button>
          </div>

          <ul className="mt-5 flex-1 space-y-3">
            {myBookings.length === 0 ? (
              <li className="flex flex-col items-center gap-2 rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                You have not booked any services yet.
                <Button asChild size="sm" variant="outline">
                  <Link href="/services">Browse services</Link>
                </Button>
              </li>
            ) : (
              myBookings.slice(0, 3).map((booking) => (
                <li
                  key={booking.id}
                  className="flex items-start justify-between gap-3 border-b pb-3 last:border-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {booking.service.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {booking.technician.user.name} ·{" "}
                      {dateFormatter.format(new Date(booking.scheduled_at))}
                    </p>
                  </div>
                  <BookingStatusBadge
                    status={deriveBookingStatus(
                      booking.status,
                      booking.payment?.status,
                    )}
                  />
                </li>
              ))
            )}
          </ul>
        </section>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Button asChild variant="outline" className="h-auto justify-start p-5">
          <Link href="/dashboard/technician/services">
            <Wrench className="text-brand" />
            <span className="flex flex-col items-start gap-0.5 text-left">
              <span className="font-medium">My services</span>
              <span className="text-xs text-muted-foreground">
                Create and edit what you offer
              </span>
            </span>
            <ArrowRight className="ml-auto" />
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto justify-start p-5">
          <Link href="/dashboard/technician/availability">
            <CalendarCheck className="text-brand" />
            <span className="flex flex-col items-start gap-0.5 text-left">
              <span className="font-medium">Availability</span>
              <span className="text-xs text-muted-foreground">
                Set the hours customers can book
              </span>
            </span>
            <ArrowRight className="ml-auto" />
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default DashboardPage;
