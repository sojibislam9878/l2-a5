import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  CalendarCheck,
  CircleSlash,
  FolderTree,
  ServerCrash,
  Star,
  TrendingUp,
  UserRound,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import BookingStatusBadge from "@/components/booking-status-badge";
import { apiRequest } from "@/lib/api-client";
import { getCurrentUser } from "@/lib/dal";
import { getSessionToken } from "@/lib/session";
import {
  STATUS_META,
  deriveBookingStatus,
  type DerivedStatus,
} from "@/lib/booking-status";
import { averageRating, formatPrice, initialsOf } from "@/lib/format";
import { visualForCategory } from "@/lib/category-visuals";
import type {
  AdminBookingListItem,
  AdminCategory,
  Service,
  User,
} from "@/lib/types";

export const metadata: Metadata = {
  title: "Platform overview",
  description: "Every user, service, booking and payment on FixItNow.",
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const STATUS_BREAKDOWN: DerivedStatus[] = [
  "requested",
  "accepted",
  "paid",
  "in_progress",
  "completed",
  "declined",
  "cancelled",
];

const Stat = ({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  hint?: string;
}) => (
  <div className="rounded-2xl border bg-card p-5">
    <div className="flex items-center gap-2 text-muted-foreground">
      <Icon className="size-4" />
      <dt className="text-xs font-medium tracking-wide uppercase">{label}</dt>
    </div>
    <dd className="mt-2 text-2xl font-semibold tracking-tight">{value}</dd>
    {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
  </div>
);

const SectionHeader = ({
  icon: Icon,
  title,
  href,
  linkLabel,
}: {
  icon: typeof Users;
  title: string;
  href: string;
  linkLabel: string;
}) => (
  <div className="flex items-start justify-between gap-3">
    <h2 className="flex items-center gap-2 font-semibold tracking-tight">
      <Icon className="size-4 text-brand" />
      {title}
    </h2>
    <Button asChild variant="ghost" size="sm" className="-mr-2 h-7 text-xs">
      <Link href={href}>
        {linkLabel}
        <ArrowRight />
      </Link>
    </Button>
  </div>
);

const Bar = ({ label, count, total }: { label: string; count: number; total: number }) => (
  <div className="space-y-1.5">
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{count}</span>
    </div>
    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-brand"
        style={{ width: total === 0 ? "0%" : `${(count / total) * 100}%` }}
      />
    </div>
  </div>
);

const AdminOverviewPage = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login?redirect=/dashboard/admin/overview");
  }

  if (user.role !== "admin") {
    redirect(`/dashboard/${user.role}`);
  }

  const token = await getSessionToken();
  const options = { token, cache: "no-store" } as const;

  const [users, bookings, services, categories] = await Promise.all([
    apiRequest<User[]>("/api/admin/users", options).catch(() => null),
    apiRequest<AdminBookingListItem[]>("/api/admin/bookings", options).catch(
      () => null,
    ),
    apiRequest<Service[]>("/api/services", { cache: "no-store" }).catch(
      () => null,
    ),
    apiRequest<AdminCategory[]>("/api/admin/categories", options).catch(
      () => null,
    ),
  ]);

  if (!users || !bookings) {
    return (
      <div className="space-y-8">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Platform overview
          </h1>
        </header>
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-16 text-center">
          <ServerCrash className="size-8 text-muted-foreground" />
          <p className="font-medium">Could not load platform data</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            The server is not responding. Please refresh to try again.
          </p>
        </div>
      </div>
    );
  }

  const serviceList = services ?? [];
  const categoryList = categories ?? [];

  const customers = users.filter((u) => u.role === "customer");
  const technicians = users.filter((u) => u.role === "technician");
  const admins = users.filter((u) => u.role === "admin");
  const banned = users.filter((u) => u.status === "ban");

  const paid = bookings.filter((b) => b.payment?.status === "completed");
  const revenue = paid.reduce((sum, b) => sum + Number(b.payment!.amount), 0);
  const pendingPayments = bookings.filter((b) => b.payment?.status === "pending");
  const failedPayments = bookings.filter((b) => b.payment?.status === "failed");
  const awaitingPayment = bookings.filter(
    (b) => b.status === "accept" && b.payment?.status !== "completed",
  );

  const derivedCounts = bookings.reduce<Partial<Record<DerivedStatus, number>>>(
    (acc, b) => {
      const key = deriveBookingStatus(b.status, b.payment?.status);
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    },
    {},
  );

  const reviews = bookings.flatMap((b) => b.review);
  const platformRating = averageRating(reviews);
  const averageBooking = paid.length > 0 ? revenue / paid.length : 0;

  const servicePrices = serviceList.map((s) => Number(s.price));
  const averagePrice =
    servicePrices.length > 0
      ? servicePrices.reduce((sum, p) => sum + p, 0) / servicePrices.length
      : 0;

  const categoryRows = categoryList
    .map((category) => ({
      ...category,
      bookings: bookings.filter((b) => b.service.category.id === category.id)
        .length,
    }))
    .sort((a, b) => b.bookings - a.bookings || b._count.service - a._count.service)
    .slice(0, 5);

  const technicianRows = technicians
    .map((tech) => {
      const jobs = bookings.filter((b) => b.technician.user_id === tech.id);
      const earned = jobs.reduce(
        (sum, b) =>
          b.payment?.status === "completed" ? sum + Number(b.payment.amount) : sum,
        0,
      );

      return { tech, jobs: jobs.length, earned };
    })
    .filter((row) => row.jobs > 0)
    .sort((a, b) => b.earned - a.earned || b.jobs - a.jobs)
    .slice(0, 5);

  const recent = bookings.slice(0, 5);

  const headline = [
    {
      icon: Wallet,
      label: "Revenue",
      value: formatPrice(revenue) ?? "$0.00",
      hint: `${paid.length} paid ${paid.length === 1 ? "booking" : "bookings"}`,
    },
    {
      icon: CalendarCheck,
      label: "Bookings",
      value: String(bookings.length),
      hint: `${derivedCounts.completed ?? 0} completed`,
    },
    {
      icon: Users,
      label: "Users",
      value: String(users.length),
      hint: `${customers.length} customers · ${technicians.length} technicians`,
    },
    {
      icon: Wrench,
      label: "Services",
      value: String(serviceList.length),
      hint: `across ${categoryList.length} ${categoryList.length === 1 ? "category" : "categories"}`,
    },
  ];

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Platform overview
        </h1>
        <p className="text-sm text-muted-foreground">
          Every user, service, booking and payment on FixItNow.
        </p>
      </header>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {headline.map((stat) => (
          <Stat key={stat.label} {...stat} />
        ))}
      </dl>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        <section className="space-y-5 rounded-2xl border bg-card p-6">
          <SectionHeader
            icon={CalendarCheck}
            title="Bookings by status"
            href="/dashboard/admin/bookings"
            linkLabel="All bookings"
          />
          {bookings.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No bookings have been made yet.
            </p>
          ) : (
            <div className="space-y-3">
              {STATUS_BREAKDOWN.map((status) => (
                <Bar
                  key={status}
                  label={STATUS_META[status].label}
                  count={derivedCounts[status] ?? 0}
                  total={bookings.length}
                />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-5 rounded-2xl border bg-card p-6">
          <SectionHeader
            icon={Users}
            title="People"
            href="/dashboard/admin/users"
            linkLabel="All users"
          />
          <dl className="grid grid-cols-2 gap-4">
            {[
              { label: "Customers", value: customers.length },
              { label: "Technicians", value: technicians.length },
              { label: "Admins", value: admins.length },
              { label: "Banned", value: banned.length },
            ].map((row) => (
              <div key={row.label} className="rounded-xl bg-muted/50 p-4">
                <dt className="text-xs text-muted-foreground">{row.label}</dt>
                <dd className="mt-1 text-xl font-semibold tracking-tight">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
          {banned.length > 0 && (
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <CircleSlash className="size-3.5 shrink-0 text-destructive" />
              {banned.length} {banned.length === 1 ? "account is" : "accounts are"}{" "}
              banned and cannot book, pay or review.
            </p>
          )}
        </section>

        <section className="space-y-5 rounded-2xl border bg-card p-6">
          <SectionHeader
            icon={Wallet}
            title="Payments"
            href="/dashboard/admin/bookings?payment=completed"
            linkLabel="Paid bookings"
          />
          <dl className="space-y-3 text-sm">
            {[
              {
                label: "Collected",
                value: formatPrice(revenue) ?? "$0.00",
                strong: true,
              },
              {
                label: "Average paid booking",
                value: formatPrice(averageBooking) ?? "$0.00",
              },
              { label: "Awaiting payment", value: String(awaitingPayment.length) },
              { label: "Checkout started", value: String(pendingPayments.length) },
              { label: "Failed", value: String(failedPayments.length) },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-baseline justify-between gap-3 border-b pb-3 last:border-0 last:pb-0"
              >
                <dt className="text-muted-foreground">{row.label}</dt>
                <dd
                  className={
                    row.strong
                      ? "text-lg font-semibold tracking-tight"
                      : "font-medium tabular-nums"
                  }
                >
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="space-y-5 rounded-2xl border bg-card p-6">
          <SectionHeader
            icon={FolderTree}
            title="Catalogue"
            href="/dashboard/admin/categories"
            linkLabel="Categories"
          />
          <dl className="grid grid-cols-3 gap-4">
            {[
              { label: "Categories", value: String(categoryList.length) },
              { label: "Services", value: String(serviceList.length) },
              { label: "Avg price", value: formatPrice(averagePrice) ?? "—" },
            ].map((row) => (
              <div key={row.label} className="rounded-xl bg-muted/50 p-4">
                <dt className="text-xs text-muted-foreground">{row.label}</dt>
                <dd className="mt-1 text-lg font-semibold tracking-tight">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>

          {categoryRows.length > 0 && (
            <ul className="space-y-2.5 border-t pt-4">
              {categoryRows.map((category) => {
                const { icon: Icon, tint } = visualForCategory(category.name);

                return (
                  <li key={category.id} className="flex items-center gap-3">
                    <span
                      className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${tint}`}
                    >
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                      {category.name}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {category._count.service}{" "}
                      {category._count.service === 1 ? "service" : "services"} ·{" "}
                      {category.bookings}{" "}
                      {category.bookings === 1 ? "booking" : "bookings"}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <section className="space-y-5 rounded-2xl border bg-card p-6">
        <SectionHeader
          icon={TrendingUp}
          title="Top technicians by revenue"
          href="/dashboard/admin/users?role=technician"
          linkLabel="All technicians"
        />
        {technicianRows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No technician has received a booking yet.
          </p>
        ) : (
          <ul className="divide-y">
            {technicianRows.map(({ tech, jobs, earned }) => (
              <li key={tech.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand/12 text-xs font-medium text-brand">
                  {initialsOf(tech.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{tech.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {jobs} {jobs === 1 ? "booking" : "bookings"}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold tracking-tight">
                  {formatPrice(earned) ?? "$0.00"}
                </span>
                <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
                  <Link href={`/dashboard/admin/users/${tech.id}`}>Details</Link>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-5 rounded-2xl border bg-card p-6">
        <SectionHeader
          icon={CalendarCheck}
          title="Latest bookings"
          href="/dashboard/admin/bookings"
          linkLabel="All bookings"
        />
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No bookings have been made yet.
          </p>
        ) : (
          <ul className="divide-y">
            {recent.map((booking) => {
              const derived = deriveBookingStatus(
                booking.status,
                booking.payment?.status,
              );

              return (
                <li
                  key={booking.id}
                  className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {booking.service.title}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {booking.user.name} → {booking.technician.user.name} ·{" "}
                      {dateFormatter.format(new Date(booking.created_at))}
                    </p>
                  </div>
                  <BookingStatusBadge status={derived} />
                  <span className="text-sm font-medium tabular-nums">
                    {formatPrice(booking.service.price) ?? "—"}
                  </span>
                  <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
                    <Link href={`/dashboard/admin/bookings/${booking.id}`}>
                      Details
                    </Link>
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-6">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/12 text-brand">
          <Star className="size-5" />
        </span>
        <div className="flex-1">
          <p className="font-semibold tracking-tight">
            {platformRating ? `${platformRating} out of 5` : "No ratings yet"}
          </p>
          <p className="text-sm text-muted-foreground">
            {reviews.length === 0
              ? "Customers can review once a job is completed and paid."
              : `Average across ${reviews.length} ${reviews.length === 1 ? "review" : "reviews"} platform-wide.`}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/admin/users">
            <UserRound />
            Manage users
          </Link>
        </Button>
      </section>
    </div>
  );
};

export default AdminOverviewPage;
