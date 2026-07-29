import type { Metadata } from "next";
import Link from "@/components/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  CalendarClock,
  ClipboardList,
  TriangleAlert,
  UserRound,
  Wrench,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api-client";
import { getCurrentUser } from "@/lib/dal";
import { getSessionToken } from "@/lib/session";
import { averageRating, formatPrice } from "@/lib/format";
import { DAY_LABELS, formatTime, groupByDay } from "@/lib/availability";
import type { TechnicianJob } from "@/lib/types";

export const metadata: Metadata = {
  title: "Technician dashboard",
  description: "Your jobs, services and availability at a glance.",
};

const TechnicianDashboardPage = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login?redirect=/dashboard/technician/overview");
  }

  if (user.role !== "technician") {
    redirect(`/dashboard/${user.role}`);
  }

  const profile = user.technician_profile;

  const jobs =
    (await apiRequest<TechnicianJob[]>("/api/technician/bookings", {
      token: await getSessionToken(),
      cache: "no-store",
    }).catch(() => [])) ?? [];

  const earnings = jobs.reduce(
    (total, job) =>
      job.payment?.status === "completed"
        ? total + Number(job.payment.amount)
        : total,
    0,
  );

  const pending = jobs.filter((job) => job.status === "pending").length;
  const inProgress = jobs.filter((job) => job.status === "in_progress").length;
  const rating = averageRating(
    jobs.flatMap((job) => job.review.map((review) => ({ rating: review.rating }))),
  );

  const schedule = groupByDay(profile?.availability ?? []);

  const stats = [
    { label: "New requests", value: String(pending) },
    { label: "In progress", value: String(inProgress) },
    { label: "Total jobs", value: String(jobs.length) },
    { label: "Earnings", value: formatPrice(earnings) ?? "$0.00" },
  ];

  const gaps = [
    !profile?.bio && "a bio",
    (profile?.skills.length ?? 0) === 0 && "skills",
    profile?.hourly_rate === null && "an hourly rate",
    schedule.length === 0 && "working hours",
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Welcome back, {user.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          Your jobs, services and availability at a glance.
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
        <section className="space-y-4 rounded-2xl border bg-card p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h2 className="flex items-center gap-2 font-semibold tracking-tight">
                <UserRound className="size-4 text-brand" />
                Service profile
              </h2>
              <p className="text-sm text-muted-foreground">
                Bio, skills, experience and hourly rate.
              </p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/technician/profile">
                Edit
                <ArrowRight />
              </Link>
            </Button>
          </div>

          <dl className="space-y-2 text-sm">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-muted-foreground">Experience</dt>
              <dd className="font-medium">
                {profile?.experience_year !== null &&
                profile?.experience_year !== undefined
                  ? `${profile.experience_year} years`
                  : "Not set"}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-muted-foreground">Hourly rate</dt>
              <dd className="font-medium">
                {formatPrice(profile?.hourly_rate) ?? "Not set"}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-muted-foreground">Rating</dt>
              <dd className="font-medium">
                {rating !== null ? rating.toFixed(1) : "No reviews yet"}
              </dd>
            </div>
          </dl>

          {(profile?.skills.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-1.5 border-t pt-4">
              {profile?.skills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4 rounded-2xl border bg-card p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h2 className="flex items-center gap-2 font-semibold tracking-tight">
                <CalendarClock className="size-4 text-brand" />
                Weekly availability
              </h2>
              <p className="text-sm text-muted-foreground">
                Customers can only book inside these hours.
              </p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/technician/availability">
                Edit
                <ArrowRight />
              </Link>
            </Button>
          </div>

          {schedule.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No working hours published yet.
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {schedule.map((entry) => (
                <li
                  key={entry.day}
                  className="flex items-baseline justify-between gap-3"
                >
                  <span className="text-muted-foreground">
                    {DAY_LABELS[entry.day]}
                  </span>
                  <span className="text-right font-medium">
                    {entry.slots
                      .map(
                        (slot) =>
                          `${formatTime(slot.start_time)} – ${formatTime(slot.end_time)}`,
                      )
                      .join(", ")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Button asChild variant="outline" className="h-auto justify-start p-5">
          <Link href="/dashboard/technician/bookings">
            <ClipboardList className="text-brand" />
            <span className="flex flex-col items-start gap-0.5 text-left">
              <span className="font-medium">Job requests</span>
              <span className="text-xs text-muted-foreground">
                Accept, decline and update progress
              </span>
            </span>
            <ArrowRight className="ml-auto" />
          </Link>
        </Button>
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
      </div>
    </div>
  );
};

export default TechnicianDashboardPage;
