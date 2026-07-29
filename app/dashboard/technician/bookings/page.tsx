import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  CalendarClock,
  ClipboardList,
  Mail,
  MapPin,
  Phone,
  ServerCrash,
  StickyNote,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import BookingStatusBadge from "@/components/booking-status-badge";
import JobActions from "./job-actions";
import { apiRequest } from "@/lib/api-client";
import { getCurrentUser } from "@/lib/dal";
import { getSessionToken } from "@/lib/session";
import { deriveBookingStatus } from "@/lib/booking-status";
import { formatPrice, initialsOf } from "@/lib/format";
import { visualForCategory } from "@/lib/category-visuals";
import type { TechnicianJob } from "@/lib/types";

export const metadata: Metadata = {
  title: "Job requests",
  description: "Bookings customers have made for your services.",
};

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const JobsPage = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/dashboard/technician/bookings");
  }

  if (user.role !== "technician") {
    redirect(`/dashboard/${user.role}`);
  }

  let jobs: TechnicianJob[];

  try {
    jobs =
      (await apiRequest<TechnicianJob[]>("/api/technician/bookings", {
        token: await getSessionToken(),
        cache: "no-store",
      })) ?? [];
  } catch {
    return (
      <div className="space-y-8">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Job requests
          </h1>
        </header>
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-16 text-center">
          <ServerCrash className="size-8 text-muted-foreground" />
          <p className="font-medium">Could not load your jobs</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            The server is not responding. Please refresh to try again.
          </p>
        </div>
      </div>
    );
  }

  const earnings = jobs.reduce(
    (total, job) =>
      job.payment?.status === "completed"
        ? total + Number(job.payment.amount)
        : total,
    0,
  );

  const stats = [
    { label: "Total jobs", value: String(jobs.length) },
    {
      label: "New requests",
      value: String(jobs.filter((job) => job.status === "pending").length),
    },
    {
      label: "In progress",
      value: String(jobs.filter((job) => job.status === "in_progress").length),
    },
    { label: "Earnings", value: formatPrice(earnings) ?? "$0.00" },
  ];

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Job requests
        </h1>
        <p className="text-sm text-muted-foreground">
          Bookings customers have made for your services. Accept, decline and
          update progress here.
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

      {jobs.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-16 text-center">
          <ClipboardList className="size-8 text-muted-foreground" />
          <p className="font-medium">No job requests yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            When a customer books one of your services, the request will appear
            here for you to accept or decline.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {jobs.map((job) => {
            const derived = deriveBookingStatus(
              job.status,
              job.payment?.status,
            );
            const { icon: Icon, tint } = visualForCategory(
              job.service.category.name,
            );
            const price = formatPrice(job.service.price);
            const awaitingPayment =
              job.status === "accept" && job.payment?.status !== "completed";

            return (
              <li key={job.id} className="rounded-2xl border bg-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <span
                      className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${tint}`}
                    >
                      <Icon className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-muted-foreground">
                        {job.service.category.name}
                      </p>
                      <h2 className="font-semibold leading-snug tracking-tight text-balance">
                        {job.service.title}
                      </h2>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {price && (
                      <span className="text-lg font-semibold tracking-tight">
                        {price}
                      </span>
                    )}
                    <BookingStatusBadge status={derived} />
                  </div>
                </div>

                <div className="mt-4 grid gap-4 border-t pt-4 sm:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="size-8">
                        <AvatarFallback className="bg-muted text-xs font-medium">
                          {initialsOf(job.user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {job.user.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Customer
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1.5 text-sm text-muted-foreground">
                      <p className="flex items-center gap-2">
                        <Mail className="size-3.5 shrink-0" />
                        <span className="truncate">{job.user.email}</span>
                      </p>
                      {job.user.phone_no && (
                        <p className="flex items-center gap-2">
                          <Phone className="size-3.5 shrink-0" />
                          {job.user.phone_no}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <CalendarClock className="size-3.5 shrink-0" />
                      <span className="text-foreground">
                        {dateTimeFormatter.format(new Date(job.scheduled_at))}
                      </span>
                    </p>
                    <p className="flex items-start gap-2">
                      <MapPin className="mt-0.5 size-3.5 shrink-0" />
                      <span>{job.address}</span>
                    </p>
                    {job.note && (
                      <p className="flex items-start gap-2">
                        <StickyNote className="mt-0.5 size-3.5 shrink-0" />
                        <span className="italic">{job.note}</span>
                      </p>
                    )}
                  </div>
                </div>

                {(awaitingPayment || job.status === "pending") && (
                  <p className="mt-4 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                    {job.status === "pending"
                      ? "The customer is waiting for you to accept or decline this request."
                      : "Accepted — waiting for the customer to pay before the job starts."}
                  </p>
                )}

                <div className="mt-4">
                  <JobActions bookingId={job.id} status={job.status} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default JobsPage;
