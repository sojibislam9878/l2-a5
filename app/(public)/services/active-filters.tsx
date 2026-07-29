"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRefetchTransition } from "@/components/refetch-boundary";
import { X } from "lucide-react";
import type { ServiceQuery } from "@/lib/services-query";
import type { Category, TechnicianSummary } from "@/lib/types";

const ActiveFilters = ({
  query,
  categories,
  technicians,
}: {
  query: ServiceQuery;
  categories: Category[];
  technicians: TechnicianSummary[];
}) => {
  const router = useRouter();
  const withSkeleton = useRefetchTransition();
  const searchParams = useSearchParams();

  const remove = (keys: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    keys.forEach((key) => params.delete(key));

    withSkeleton(() =>
      router.replace(params.toString() ? `/services?${params}` : "/services", {
        scroll: false,
      }),
    );
  };

  const chips: { label: string; keys: string[] }[] = [];

  if (query.searchTerm) {
    chips.push({ label: `“${query.searchTerm}”`, keys: ["searchTerm"] });
  }

  if (query.category_id) {
    const name = categories.find((item) => item.id === query.category_id)?.name;
    chips.push({ label: name ?? "Category", keys: ["category_id"] });
  }

  if (query.technician_id) {
    const name = technicians.find((item) => item.id === query.technician_id)
      ?.user.name;
    chips.push({ label: name ?? "Technician", keys: ["technician_id"] });
  }

  if (query.minPrice || query.maxPrice) {
    const label =
      query.minPrice && query.maxPrice
        ? `$${query.minPrice} – $${query.maxPrice}`
        : query.minPrice
          ? `From $${query.minPrice}`
          : `Up to $${query.maxPrice}`;

    chips.push({ label, keys: ["minPrice", "maxPrice"] });
  }

  if (!chips.length) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.keys.join("-")}
          type="button"
          onClick={() => remove(chip.keys)}
          className="group flex cursor-pointer items-center gap-1.5 rounded-full border bg-card py-1 pr-1.5 pl-3 text-xs font-medium transition-colors hover:border-brand/40"
        >
          {chip.label}
          <span className="flex size-4 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
            <X className="size-2.5" strokeWidth={3} />
          </span>
        </button>
      ))}
    </div>
  );
};

export default ActiveFilters;
