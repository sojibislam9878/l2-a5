import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { averageRating, formatPrice, initialsOf } from "@/lib/format";
import { visualForCategory } from "@/lib/category-visuals";
import type { Service } from "@/lib/types";

const ServiceCard = ({ service }: { service: Service }) => {
  const rating = averageRating(service.review);
  const price = formatPrice(service.price);
  const { icon: Icon, tint } = visualForCategory(service.category.name);

  return (
    <article className="group relative flex h-full flex-col rounded-2xl border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/40">
      <div className="flex items-start gap-3">
        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${tint}`}
        >
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground">
            {service.category.name}
          </p>
          <h3 className="mt-0.5 font-semibold leading-snug tracking-tight text-balance">
            {service.title}
          </h3>
        </div>
        <ArrowUpRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
        {service.description}
      </p>

      <div className="mt-4 mb-5 flex items-center gap-2">
        {rating !== null ? (
          <span className="flex items-center gap-1 rounded-md bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
            <Star className="size-3 fill-brand text-brand" />
            {rating.toFixed(1)} ({service.review.length})
          </span>
        ) : (
          <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            New listing
          </span>
        )}
        {service.technician.experience_year !== null && (
          <span className="text-xs text-muted-foreground">
            {service.technician.experience_year} yrs experience
          </span>
        )}
      </div>

      <div className="mt-auto flex items-end justify-between gap-3 border-t pt-4">
        <Link
          href={`/technicians/${service.technician_id}`}
          className="flex min-w-0 items-center gap-2"
        >
          <Avatar className="size-7">
            <AvatarFallback className="bg-muted text-[0.65rem] font-medium">
              {initialsOf(service.technician.user.name)}
            </AvatarFallback>
          </Avatar>
          <span className="min-w-0 truncate text-sm font-medium transition-colors group-hover:text-brand">
            {service.technician.user.name}
          </span>
        </Link>
        {price && (
          <span className="shrink-0 text-right leading-none">
            <span className="block text-lg font-semibold tracking-tight">
              {price}
            </span>
            <span className="mt-1 block text-[0.7rem] text-muted-foreground">
              starting at
            </span>
          </span>
        )}
      </div>
    </article>
  );
};

export default ServiceCard;
