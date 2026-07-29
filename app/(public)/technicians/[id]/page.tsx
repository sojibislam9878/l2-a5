import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  CalendarClock,
  CalendarDays,
  CircleSlash,
  Mail,
  MessageSquareQuote,
  Phone,
  Star,
  Wrench,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ApiError, apiRequest } from "@/lib/api-client";
import { averageRating, formatPrice, initialsOf } from "@/lib/format";
import { visualForCategory } from "@/lib/category-visuals";
import { DAY_LABELS, formatTime, groupByDay } from "@/lib/availability";
import type { TechnicianDetail } from "@/lib/types";

const fetchTechnician = async (id: string) => {
  try {
    return await apiRequest<TechnicianDetail>(`/api/technicians/${id}`, {
      cache: "no-store",
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
};

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> => {
  const { id } = await params;
  const technician = await fetchTechnician(id).catch(() => null);

  if (!technician) {
    return { title: "Technician not found" };
  }

  return {
    title: technician.user.name,
    description:
      technician.bio?.slice(0, 155) ??
      `Book ${technician.user.name} on FixItNow.`,
  };
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

const Stars = ({ rating }: { rating: number }) => (
  <span className="flex items-center gap-0.5">
    {Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`size-3.5 ${
          index < rating ? "fill-brand text-brand" : "text-muted-foreground/30"
        }`}
      />
    ))}
  </span>
);

const TechnicianDetailPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const technician = await fetchTechnician(id);

  if (!technician) {
    notFound();
  }

  const rating = averageRating(technician.review);
  const rate = formatPrice(technician.hourly_rate);
  const schedule = groupByDay(technician.availability);
  const isBanned = technician.user.status === "ban";

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: technician.review.filter((review) => review.rating === star).length,
  }));

  const serviceTitles = new Map(
    technician.service.map((service) => [service.id, service.title]),
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="-ml-2 text-muted-foreground"
      >
        <Link href="/technicians">
          <ArrowLeft />
          Back to technicians
        </Link>
      </Button>

      <section className="mt-6 overflow-hidden rounded-2xl border bg-card">
        <div className="relative h-24 bg-brand/10">
          <div
            aria-hidden
            className="absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] [background-size:32px_32px]"
          />
        </div>
        <div className="-mt-10 flex flex-col gap-5 px-6 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <Avatar className="size-20 border-4 border-card">
              <AvatarFallback className="bg-brand text-xl font-semibold text-brand-foreground">
                {initialsOf(technician.user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 pb-1">
              <h1 className="truncate text-2xl font-semibold tracking-tight">
                {technician.user.name}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                {rating !== null ? (
                  <span className="flex items-center gap-1.5 font-medium text-brand">
                    <Star className="size-3.5 fill-brand text-brand" />
                    {rating.toFixed(1)}
                    <span className="font-normal text-muted-foreground">
                      ({technician.review.length}{" "}
                      {technician.review.length === 1 ? "review" : "reviews"})
                    </span>
                  </span>
                ) : (
                  <span>No reviews yet</span>
                )}
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="size-3.5" />
                  Joined {monthFormatter.format(new Date(technician.createdAt))}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start gap-3 pb-1 sm:items-end">
            {isBanned && (
              <Badge
                variant="secondary"
                className="bg-destructive/10 text-destructive"
              >
                <CircleSlash className="size-3" />
                Banned
              </Badge>
            )}
            <dl className="flex divide-x rounded-xl border bg-muted/40">
              {technician.experience_year !== null && (
                <div className="px-4 py-2 text-center">
                  <dd className="text-lg leading-tight font-semibold tracking-tight">
                    {technician.experience_year}
                  </dd>
                  <dt className="mt-0.5 text-xs whitespace-nowrap text-muted-foreground">
                    years exp.
                  </dt>
                </div>
              )}
              {rate && (
                <div className="px-4 py-2 text-center">
                  <dd className="text-lg leading-tight font-semibold tracking-tight">
                    {rate}
                  </dd>
                  <dt className="mt-0.5 text-xs whitespace-nowrap text-muted-foreground">
                    per hour
                  </dt>
                </div>
              )}
              <div className="px-4 py-2 text-center">
                <dd className="text-lg leading-tight font-semibold tracking-tight">
                  {technician.service.length}
                </dd>
                <dt className="mt-0.5 text-xs whitespace-nowrap text-muted-foreground">
                  {technician.service.length === 1 ? "service" : "services"}
                </dt>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {isBanned && (
        <p className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          This technician is banned, so their services cannot be booked right
          now.
        </p>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_19rem] lg:gap-10">
        <div className="min-w-0 space-y-10">
          {technician.bio && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold tracking-tight">About</h2>
              <p className="leading-relaxed whitespace-pre-line text-muted-foreground">
                {technician.bio}
              </p>
            </section>
          )}

          {technician.skills.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold tracking-tight">Skills</h2>
              <div className="flex flex-wrap gap-1.5">
                {technician.skills.map((skill) => (
                  <Link
                    key={skill}
                    href={`/technicians?skills=${encodeURIComponent(skill)}`}
                  >
                    <Badge
                      variant="secondary"
                      className="transition-colors hover:bg-brand/10 hover:text-brand"
                    >
                      {skill}
                    </Badge>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <Separator />

          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
              <Wrench className="size-4 text-brand" />
              Services
              <span className="text-sm font-normal text-muted-foreground">
                ({technician.service.length})
              </span>
            </h2>

            {technician.service.length === 0 ? (
              <p className="rounded-2xl border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
                This technician has not listed any services yet.
              </p>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2">
                {technician.service.map((service) => {
                  const { icon: Icon, tint } = visualForCategory(
                    service.category.name,
                  );
                  const serviceRating = averageRating(service.review);
                  const price = formatPrice(service.price);

                  return (
                    <li key={service.id}>
                      <Link
                        href={`/services/${service.id}`}
                        className="group flex h-full flex-col rounded-2xl border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md"
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${tint}`}
                          >
                            <Icon className="size-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-muted-foreground">
                              {service.category.name}
                            </p>
                            <h3 className="mt-0.5 text-sm font-semibold leading-snug text-balance group-hover:text-brand">
                              {service.title}
                            </h3>
                          </div>
                          <ArrowUpRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>

                        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                          {service.description}
                        </p>

                        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                          {serviceRating !== null ? (
                            <span className="flex items-center gap-1 text-xs font-medium text-brand">
                              <Star className="size-3 fill-brand text-brand" />
                              {serviceRating.toFixed(1)} ({service.review.length})
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              New
                            </span>
                          )}
                          {price && (
                            <span className="text-sm font-semibold tracking-tight">
                              {price}
                            </span>
                          )}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
              <MessageSquareQuote className="size-4 text-brand" />
              Reviews
              {technician.review.length > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  ({technician.review.length})
                </span>
              )}
            </h2>

            {technician.review.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-10 text-center">
                <MessageSquareQuote className="size-7 text-muted-foreground" />
                <p className="text-sm font-medium">No reviews yet</p>
                <p className="max-w-sm text-xs text-muted-foreground">
                  Only customers with a completed booking can leave a review.
                </p>
              </div>
            ) : (
              <>
                {rating !== null && (
                  <div className="flex flex-col gap-4 rounded-2xl border bg-card p-5 sm:flex-row sm:items-center sm:gap-8">
                    <div className="text-center sm:w-28 sm:shrink-0">
                      <p className="text-3xl font-semibold tracking-tight">
                        {rating.toFixed(1)}
                      </p>
                      <div className="mt-1 flex justify-center">
                        <Stars rating={Math.round(rating)} />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {technician.review.length}{" "}
                        {technician.review.length === 1 ? "review" : "reviews"}
                      </p>
                    </div>
                    <dl className="flex-1 space-y-1.5">
                      {ratingCounts.map(({ star, count }) => (
                        <div key={star} className="flex items-center gap-2">
                          <dt className="w-8 shrink-0 text-xs text-muted-foreground">
                            {star}★
                          </dt>
                          <dd className="flex flex-1 items-center gap-2">
                            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                              <span
                                className="block h-full rounded-full bg-brand"
                                style={{
                                  width: `${technician.review.length ? (count / technician.review.length) * 100 : 0}%`,
                                }}
                              />
                            </span>
                            <span className="w-4 shrink-0 text-right text-xs text-muted-foreground">
                              {count}
                            </span>
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}

                <ul className="space-y-3">
                  {technician.review.map((review) => (
                    <li
                      key={review.id}
                      className="rounded-2xl border bg-card p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <Avatar className="size-8">
                            <AvatarFallback className="bg-muted text-xs font-medium">
                              {initialsOf(review.user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {review.user.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {dateFormatter.format(new Date(review.created_at))}
                            </p>
                          </div>
                        </div>
                        <Stars rating={review.rating} />
                      </div>

                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {review.comment}
                      </p>

                      {serviceTitles.has(review.service_id) && (
                        <Link
                          href={`/services/${review.service_id}`}
                          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-brand"
                        >
                          on {serviceTitles.get(review.service_id)}
                          <ArrowUpRight className="size-3" />
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:h-fit">
          <div className="space-y-4 rounded-2xl border bg-card p-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <BadgeCheck className="size-4 text-brand" />
              Contact
            </h2>
            <div className="space-y-3 text-sm">
              <p className="flex items-start gap-2">
                <Mail className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                <span className="min-w-0 break-words">
                  {technician.user.email}
                </span>
              </p>
              {technician.user.phone_no && (
                <p className="flex items-center gap-2">
                  <Phone className="size-3.5 shrink-0 text-muted-foreground" />
                  {technician.user.phone_no}
                </p>
              )}
            </div>
            <p className="border-t pt-3 text-xs text-muted-foreground">
              Book through a service below — payment is only requested after the
              technician accepts.
            </p>
          </div>

          <div className="space-y-4 rounded-2xl border bg-card p-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <CalendarClock className="size-4 text-brand" />
              Weekly availability
            </h2>

            {schedule.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                This technician has not published working hours yet.
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
          </div>
        </aside>
      </div>
    </div>
  );
};

export default TechnicianDetailPage;
