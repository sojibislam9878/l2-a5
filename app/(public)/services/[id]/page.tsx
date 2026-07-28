import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarClock,
  Clock,
  Mail,
  MessageSquareQuote,
  Phone,
  Star,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import BookButton from "@/components/book-button";
import { ApiError, apiRequest } from "@/lib/api-client";
import { getCurrentUser } from "@/lib/dal";
import { averageRating, formatPrice, initialsOf } from "@/lib/format";
import { visualForCategory } from "@/lib/category-visuals";
import { DAY_LABELS, formatTime, groupByDay } from "@/lib/availability";
import type { ServiceDetail } from "@/lib/types";

const fetchService = async (id: string) => {
  try {
    return await apiRequest<ServiceDetail>(`/api/services/${id}`, {
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
  const service = await fetchService(id).catch(() => null);

  if (!service) {
    return { title: "Service not found" };
  }

  return {
    title: service.title,
    description: service.description.slice(0, 155),
  };
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const ServiceDetailPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const [service, user] = await Promise.all([
    fetchService(id),
    getCurrentUser(),
  ]);

  if (!service) {
    notFound();
  }

  const { icon: Icon, tint } = visualForCategory(service.category.name);
  const rating = averageRating(service.review);
  const price = formatPrice(service.price);
  const hourlyRate = formatPrice(service.technician.hourly_rate);
  const schedule = groupByDay(service.technician.availability);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
      <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
        <Link href="/services">
          <ArrowLeft />
          Back to services
        </Link>
      </Button>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_20rem] lg:gap-12">
        <div className="min-w-0 space-y-10">
          <header className="space-y-4">
            <div className="flex items-center gap-3">
              <span
                className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${tint}`}
              >
                <Icon className="size-6" />
              </span>
              <div>
                <Link
                  href={`/services?category_id=${service.category_id}`}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-brand"
                >
                  {service.category.name}
                </Link>
                <p className="text-xs text-muted-foreground">
                  Listed {dateFormatter.format(new Date(service.created_at))}
                </p>
              </div>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              {service.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3">
              {rating !== null ? (
                <span className="flex items-center gap-1.5 rounded-lg bg-brand/10 px-2.5 py-1 text-sm font-medium text-brand">
                  <Star className="size-3.5 fill-brand text-brand" />
                  {rating.toFixed(1)}
                  <span className="font-normal">
                    ({service.review.length}{" "}
                    {service.review.length === 1 ? "review" : "reviews"})
                  </span>
                </span>
              ) : (
                <Badge variant="secondary">New listing</Badge>
              )}
              {service.technician.experience_year !== null && (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <BadgeCheck className="size-4" />
                  {service.technician.experience_year} years experience
                </span>
              )}
            </div>
          </header>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight">
              About this service
            </h2>
            <p className="leading-relaxed whitespace-pre-line text-muted-foreground">
              {service.description}
            </p>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="text-lg font-semibold tracking-tight">
              About the technician
            </h2>

            <div className="rounded-2xl border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar className="size-12">
                    <AvatarFallback className="bg-brand/12 font-medium text-brand">
                      {initialsOf(service.technician.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {service.technician.user.name}
                    </p>
                    {hourlyRate && (
                      <p className="text-sm text-muted-foreground">
                        {hourlyRate} / hour
                      </p>
                    )}
                  </div>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/technicians/${service.technician_id}`}>
                    View profile
                  </Link>
                </Button>
              </div>

              {service.technician.bio && (
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {service.technician.bio}
                </p>
              )}

              {service.technician.skills.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {service.technician.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t pt-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Mail className="size-3.5" />
                  {service.technician.user.email}
                </span>
                {service.technician.user.phone_no && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="size-3.5" />
                    {service.technician.user.phone_no}
                  </span>
                )}
              </div>
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
              Reviews
              {service.review.length > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  ({service.review.length})
                </span>
              )}
            </h2>

            {service.review.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-10 text-center">
                <MessageSquareQuote className="size-7 text-muted-foreground" />
                <p className="text-sm font-medium">No reviews yet</p>
                <p className="max-w-sm text-xs text-muted-foreground">
                  Only customers with a completed booking can leave a review.
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {service.review.map((review) => (
                  <li key={review.id} className="rounded-2xl border bg-card p-5">
                    <div className="flex items-center justify-between gap-3">
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
                      <span className="flex shrink-0 items-center gap-0.5">
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
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {review.comment}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="space-y-5 rounded-2xl border bg-card p-6 shadow-sm">
            <div>
              <p className="text-sm text-muted-foreground">Service price</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight">
                {price ?? "—"}
              </p>
            </div>

            <BookButton
              serviceId={service.id}
              serviceTitle={service.title}
              availability={service.technician.availability}
              isAuthenticated={Boolean(user)}
            />

            <Separator />

            <div className="space-y-3">
              <p className="flex items-center gap-2 text-sm font-medium">
                <CalendarClock className="size-4 text-brand" />
                Weekly availability
              </p>
              {schedule.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  This technician has not published working hours yet.
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {schedule.map((entry) => (
                    <li
                      key={entry.day}
                      className="flex items-baseline justify-between gap-3 text-sm"
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

            <p className="flex items-start gap-2 border-t pt-4 text-xs text-muted-foreground">
              <Clock className="mt-0.5 size-3.5 shrink-0" />
              Payment is only requested after the technician accepts your
              booking.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ServiceDetailPage;
