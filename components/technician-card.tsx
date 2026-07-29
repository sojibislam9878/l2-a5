import Link from "next/link";
import { ArrowRight, BadgeCheck, Briefcase, Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { averageRating, formatPrice, initialsOf } from "@/lib/format";
import { visualForCategory } from "@/lib/category-visuals";
import type { TechnicianListItem } from "@/lib/types";

const TechnicianCard = ({
  technician,
}: {
  technician: TechnicianListItem;
}) => {
  const rating = averageRating(technician.review);
  const rate = formatPrice(technician.hourly_rate);
  const categories = [
    ...new Map(
      technician.service.map((service) => [
        service.category.id,
        service.category.name,
      ]),
    ).values(),
  ];

  return (
    <article className="group flex h-full flex-col rounded-2xl border bg-card p-5 transition-all duration-200 hover:border-brand/40 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/40">
      <div className="flex items-start gap-3">
        <Avatar className="size-12">
          <AvatarFallback className="bg-brand/12 font-semibold text-brand">
            {initialsOf(technician.user.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold tracking-tight">
            <Link
              href={`/technicians/${technician.id}`}
              className="transition-colors hover:text-brand"
            >
              {technician.user.name}
            </Link>
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {rating !== null ? (
              <span className="flex items-center gap-1 font-medium text-brand">
                <Star className="size-3 fill-brand text-brand" />
                {rating.toFixed(1)} ({technician.review.length})
              </span>
            ) : (
              <span>No reviews yet</span>
            )}
            {technician.experience_year !== null && (
              <span className="flex items-center gap-1">
                <BadgeCheck className="size-3" />
                {technician.experience_year} yrs
              </span>
            )}
            <span className="flex items-center gap-1">
              <Briefcase className="size-3" />
              {technician.service.length}{" "}
              {technician.service.length === 1 ? "service" : "services"}
            </span>
          </div>
        </div>
      </div>

      {technician.bio && (
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {technician.bio}
        </p>
      )}

      {technician.skills.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {technician.skills.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
            >
              {skill}
            </span>
          ))}
          {technician.skills.length > 4 && (
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
              +{technician.skills.length - 4}
            </span>
          )}
        </div>
      )}

      {categories.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {categories.slice(0, 3).map((name) => {
            const { icon: Icon, tint } = visualForCategory(name);

            return (
              <span
                key={name}
                className={`flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${tint}`}
              >
                <Icon className="size-3" />
                {name}
              </span>
            );
          })}
        </div>
      )}

      <div className="mt-auto pt-5">
        <div className="flex items-end justify-between gap-3 border-t pt-4">
          <span className="leading-none">
            {rate ? (
              <>
                <span className="block text-lg font-semibold tracking-tight">
                  {rate}
                </span>
                <span className="mt-1 block text-[0.7rem] text-muted-foreground">
                  per hour
                </span>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">
                Rate not set
              </span>
            )}
          </span>
          <Button asChild variant="outline" size="sm">
            <Link href={`/technicians/${technician.id}`}>
              View profile
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
};

export default TechnicianCard;
