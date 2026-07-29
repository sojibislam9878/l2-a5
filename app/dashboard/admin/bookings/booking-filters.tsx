"use client";

import { useEffect, useState } from "react";
import FilterLink from "@/components/filter-link";
import { useRouter, useSearchParams } from "next/navigation";
import { useRefetchTransition } from "@/components/refetch-boundary";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const STATUSES = [
  { value: "", label: "All" },
  { value: "pending", label: "Requested" },
  { value: "accept", label: "Accepted" },
  { value: "in_progress", label: "In progress" },
  { value: "complete", label: "Completed" },
  { value: "decline", label: "Declined" },
  { value: "cancel", label: "Cancelled" },
];

const PAYMENTS = [
  { value: "", label: "Any payment" },
  { value: "completed", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "none", label: "Not paid" },
];

const BASE = "/dashboard/admin/bookings";

const buildHref = (current: URLSearchParams, key: string, value: string) => {
  const params = new URLSearchParams(current.toString());

  if (value) {
    params.set(key, value);
  } else {
    params.delete(key);
  }

  return params.toString() ? `${BASE}?${params}` : BASE;
};

const BookingFilters = ({
  q,
  status,
  payment,
}: {
  q: string;
  status: string;
  payment: string;
}) => {
  const router = useRouter();
  const withSkeleton = useRefetchTransition();
  const searchParams = useSearchParams();
  const [term, setTerm] = useState(q);

  useEffect(() => {
    const handle = setTimeout(() => {
      if (term === (searchParams.get("q") ?? "")) {
        return;
      }

      withSkeleton(() =>
        router.replace(buildHref(searchParams, "q", term), { scroll: false }),
      );
    }, 350);

    return () => clearTimeout(handle);
  }, [term, searchParams, router, withSkeleton]);

  const group = (
    label: string,
    options: { value: string; label: string }[],
    active: string,
    key: string,
  ) => (
    <div
      className="flex flex-wrap items-center gap-1.5"
      role="group"
      aria-label={label}
    >
      {options.map((option) => {
        const isActive = active === option.value;

        return (
          <FilterLink
            key={option.value || "all"}
            href={buildHref(searchParams, key, option.value)}
            scroll={false}
            aria-current={isActive ? "true" : undefined}
            className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              isActive
                ? "border-brand bg-brand/10 text-brand"
                : "border-border text-muted-foreground hover:border-brand/40 hover:text-foreground"
            }`}
          >
            {option.label}
          </FilterLink>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="relative sm:max-w-xs">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Search service, customer or technician"
          aria-label="Search bookings"
          className="pl-9"
          suppressHydrationWarning
        />
        {term && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Clear search"
            className="absolute top-1/2 right-1 -translate-y-1/2 text-muted-foreground"
            onClick={() => setTerm("")}
          >
            <X />
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
        {group("Booking status", STATUSES, status, "status")}
        <span className="hidden h-4 w-px bg-border sm:block" />
        {group("Payment", PAYMENTS, payment, "payment")}
      </div>
    </div>
  );
};

export default BookingFilters;
