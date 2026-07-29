import type { Metadata } from "next";
import Link from "@/components/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarClock,
  CalendarDays,
  CircleCheck,
  CircleSlash,
  Hash,
  Mail,
  Phone,
  Star,
  UserRound,
  Wrench,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import BookingStatusBadge from "@/components/booking-status-badge";
import UserStatusButton from "@/components/user-status-button";
import { ApiError, apiRequest } from "@/lib/api-client";
import { getCurrentUser } from "@/lib/dal";
import { getSessionToken } from "@/lib/session";
import { deriveBookingStatus } from "@/lib/booking-status";
import { averageRating, formatPrice, initialsOf } from "@/lib/format";
import { visualForCategory } from "@/lib/category-visuals";
import { DAY_LABELS, formatTime, groupByDay } from "@/lib/availability";
import type { AdminUserDetail } from "@/lib/types";

export const metadata: Metadata = {
  title: "User details",
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

const AdminUserDetailPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const viewer = await getCurrentUser();

  if (!viewer) {
    redirect(`/auth/login?redirect=/dashboard/admin/users/${id}`);
  }

  if (viewer.role !== "admin") {
    redirect(`/dashboard/${viewer.role}`);
  }

  let user: AdminUserDetail | undefined;

  try {
    user = await apiRequest<AdminUserDetail>(`/api/admin/users/${id}`, {
      token: await getSessionToken(),
      cache: "no-store",
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }

  if (!user) {
    notFound();
  }

  const isActive = user.status === "unban";
  const isTechnician = user.role === "technician";
  const profile = user.technician_profile;
  const rating = averageRating(profile?.review ?? []);
  const schedule = groupByDay(profile?.availability ?? []);

  const stats = isTechnician
    ? [
        { label: "Services", value: String(profile?.service.length ?? 0) },
        { label: "Jobs received", value: String(profile?.booking.length ?? 0) },
        {
          label: "Rating",
          value: rating !== null ? rating.toFixed(1) : "—",
        },
        { label: "Bookings made", value: String(user.booking.length) },
      ]
    : [
        { label: "Bookings made", value: String(user.booking.length) },
        { label: "Reviews written", value: String(user.review.length) },
        {
          label: "Completed",
          value: String(
            user.booking.filter((booking) => booking.status === "complete")
              .length,
          ),
        },
        {
          label: "Paid",
          value: String(
            user.booking.filter(
              (booking) => booking.payment?.status === "completed",
            ).length,
          ),
        },
      ];

  return (
    <div className="space-y-8">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="-ml-2 text-muted-foreground"
      >
        <Link href="/dashboard/admin/users">
          <ArrowLeft />
          Back to all users
        </Link>
      </Button>

      <section className="overflow-hidden rounded-2xl border bg-card">
        <div className="relative h-20 bg-brand/10">
          <div
            aria-hidden
            className="absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] [background-size:32px_32px]"
          />
        </div>
        <div className="-mt-9 flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <Avatar className="size-18 border-4 border-card">
              <AvatarFallback className="bg-brand text-lg font-semibold text-brand-foreground">
                {initialsOf(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 pb-1">
              <h1 className="truncate text-xl font-semibold tracking-tight">
                {user.name}
              </h1>
              <p className="truncate text-sm text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pb-1">
            <UserStatusButton
              userId={user.id}
              name={user.name}
              status={user.status}
            />
            <Badge variant="secondary" className="bg-brand/10 text-brand">
              {isTechnician ? (
                <Wrench className="size-3" />
              ) : (
                <UserRound className="size-3" />
              )}
              {isTechnician ? "Technician" : "Customer"}
            </Badge>
            <Badge
              variant="secondary"
              className={
                isActive
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-destructive/10 text-destructive"
              }
            >
              {isActive ? (
                <CircleCheck className="size-3" />
              ) : (
                <CircleSlash className="size-3" />
              )}
              {isActive ? "Active" : "Banned"}
            </Badge>
          </div>
        </div>
      </section>

      {!isActive && (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          This user is banned. {user.name} cannot book, pay, review or manage
          jobs until they are unbanned.
        </p>
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

      <div className="grid gap-6 lg:grid-cols-[1fr_18rem] lg:gap-8">
        <div className="min-w-0 space-y-6">
          {isTechnician && profile && (
            <section className="space-y-4 rounded-2xl border bg-card p-6">
              <h2 className="font-semibold tracking-tight">Service profile</h2>

              {profile.bio ? (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {profile.bio}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No bio provided.
                </p>
              )}

              <dl className="grid gap-4 border-t pt-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-muted-foreground">Experience</dt>
                  <dd className="font-medium">
                    {profile.experience_year !== null
                      ? `${profile.experience_year} years`
                      : "Not set"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Hourly rate</dt>
                  <dd className="font-medium">
                    {formatPrice(profile.hourly_rate) ?? "Not set"}
                  </dd>
                </div>
              </dl>

              {profile.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 border-t pt-4">
                  {profile.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}
            </section>
          )}

          {isTechnician && (profile?.service.length ?? 0) > 0 && (
            <section className="space-y-4 rounded-2xl border bg-card p-6">
              <h2 className="font-semibold tracking-tight">
                Services listed
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({profile?.service.length})
                </span>
              </h2>
              <ul className="divide-y">
                {profile?.service.map((service) => {
                  const { icon: Icon, tint } = visualForCategory(
                    service.category.name,
                  );

                  return (
                    <li
                      key={service.id}
                      className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <span
                        className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${tint}`}
                      >
                        <Icon className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {service.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {service.category.name}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold">
                        {formatPrice(service.price)}
                      </span>
                      <Button asChild variant="ghost" size="icon-sm">
                        <Link href={`/services/${service.id}`}>
                          <ArrowUpRight />
                        </Link>
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          <section className="space-y-4 rounded-2xl border bg-card p-6">
            <h2 className="font-semibold tracking-tight">
              Bookings made
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({user.booking.length})
              </span>
            </h2>

            {user.booking.length === 0 ? (
              <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                This user has not booked any services.
              </p>
            ) : (
              <ul className="divide-y">
                {user.booking.map((booking) => (
                  <li
                    key={booking.id}
                    className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {booking.service.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {booking.technician.user.name} ·{" "}
                        {dateTimeFormatter.format(new Date(booking.scheduled_at))}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold">
                      {formatPrice(booking.service.price)}
                    </span>
                    <BookingStatusBadge
                      status={deriveBookingStatus(
                        booking.status,
                        booking.payment?.status,
                      )}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:h-fit">
          <div className="space-y-4 rounded-2xl border bg-card p-6">
            <h2 className="text-sm font-semibold">Account</h2>
            <dl className="space-y-4 text-sm">
              <div className="space-y-1">
                <dt className="flex items-center gap-1.5 text-muted-foreground">
                  <Mail className="size-3.5" />
                  Email
                </dt>
                <dd className="font-medium break-words">{user.email}</dd>
              </div>
              <div className="space-y-1">
                <dt className="flex items-center gap-1.5 text-muted-foreground">
                  <Phone className="size-3.5" />
                  Phone
                </dt>
                <dd className="font-medium">
                  {user.phone_no || (
                    <span className="font-normal text-muted-foreground">
                      Not provided
                    </span>
                  )}
                </dd>
              </div>
              <div className="space-y-1">
                <dt className="flex items-center gap-1.5 text-muted-foreground">
                  <CalendarDays className="size-3.5" />
                  Joined
                </dt>
                <dd className="font-medium">
                  {dateFormatter.format(new Date(user.createdAt))}
                </dd>
              </div>
              <div className="space-y-1">
                <dt className="flex items-center gap-1.5 text-muted-foreground">
                  <Hash className="size-3.5" />
                  User ID
                </dt>
                <dd className="font-mono text-[0.7rem] break-all">{user.id}</dd>
              </div>
            </dl>
          </div>

          {isTechnician && (
            <div className="space-y-4 rounded-2xl border bg-card p-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <CalendarClock className="size-4 text-brand" />
                Weekly availability
              </h2>

              {schedule.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No working hours published.
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

              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href={`/technicians/${profile?.id}`}>
                  <Star />
                  View public profile
                </Link>
              </Button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default AdminUserDetailPage;
