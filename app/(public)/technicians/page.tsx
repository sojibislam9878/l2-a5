import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "@/components/link";
import { SearchX, ServerCrash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import TechnicianCard from "@/components/technician-card";
import RefetchBoundary from "@/components/refetch-boundary";
import TechnicianFilters from "./technician-filters";
import FiltersSheet from "./filters-sheet";
import { apiRequest } from "@/lib/api-client";
import {
  parseTechnicianQuery,
  technicianFilterCount,
  toTechnicianSearchString,
  type TechnicianQuery,
} from "@/lib/technicians-query";
import type { TechnicianListItem } from "@/lib/types";

export const metadata: Metadata = {
  title: "Browse technicians",
  description:
    "Find vetted technicians by skill, experience and hourly rate on FixItNow.",
};

const ResultsSkeleton = () => (
  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
    {Array.from({ length: 6 }, (_, index) => (
      <div key={index} className="space-y-4 rounded-2xl border bg-card p-5">
        <div className="flex gap-3">
          <Skeleton className="size-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-36" />
          </div>
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex items-center justify-between border-t pt-4">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    ))}
  </div>
);

const buildSearch = (query: TechnicianQuery) => {
  const search = new URLSearchParams();

  if (query.searchTerm) search.set("searchTerm", query.searchTerm);
  if (query.skills) search.set("skills", query.skills);
  if (query.minExperience) search.set("minExperience", query.minExperience);
  if (query.maxExperience) search.set("maxExperience", query.maxExperience);
  if (query.minRate) search.set("minRate", query.minRate);
  if (query.maxRate) search.set("maxRate", query.maxRate);
  search.set("sortBy", query.sortBy);
  search.set("sortOrder", query.sortOrder);

  return search.toString();
};

const Results = async ({ query }: { query: TechnicianQuery }) => {
  let technicians: TechnicianListItem[];

  try {
    technicians =
      (await apiRequest<TechnicianListItem[]>(
        `/api/technicians?${buildSearch(query)}`,
        { cache: "no-store" },
      )) ?? [];
  } catch {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-16 text-center">
        <ServerCrash className="size-8 text-muted-foreground" />
        <p className="font-medium">Could not load technicians</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          The server is not responding. Please refresh the page to try again.
        </p>
      </div>
    );
  }

  if (!technicians.length) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-16 text-center">
        <SearchX className="size-8 text-muted-foreground" />
        <p className="font-medium">No technicians match your filters</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Try widening the experience or rate range, or clearing the selected
          skill.
        </p>
        <Button asChild variant="outline" size="sm" className="mt-1">
          <Link href="/technicians">Clear all filters</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <p className="text-sm text-muted-foreground">
        Showing{" "}
        <span className="font-medium text-foreground">
          {technicians.length}
        </span>{" "}
        {technicians.length === 1 ? "technician" : "technicians"}
      </p>
      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {technicians.map((technician) => (
          <TechnicianCard key={technician.id} technician={technician} />
        ))}
      </div>
    </>
  );
};

const TechniciansPage = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const params = await searchParams;
  const query = parseTechnicianQuery(params);

  const all =
    (await apiRequest<TechnicianListItem[]>("/api/technicians", {
      revalidate: 300,
    }).catch(() => [])) ?? [];

  const allSkills = [...new Set(all.flatMap((item) => item.skills))].sort();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Browse technicians
        </h1>
        <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
          Compare skills, experience and hourly rates, then book directly from a
          technician&apos;s services.
        </p>
      </header>

      <div className="mt-8 lg:hidden">
        <FiltersSheet
          query={query}
          allSkills={allSkills}
          activeCount={technicianFilterCount(query)}
        />
      </div>

      <div className="mt-6 grid gap-8 lg:mt-10 lg:grid-cols-[16rem_1fr] lg:gap-10">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border bg-card p-5">
            <TechnicianFilters query={query} allSkills={allSkills} />
          </div>
        </aside>

        <section className="min-w-0">
          <RefetchBoundary fallback={<ResultsSkeleton />}>
            <Suspense
              key={toTechnicianSearchString(query)}
              fallback={<ResultsSkeleton />}
            >
              <Results query={query} />
            </Suspense>
          </RefetchBoundary>
        </section>
      </div>
    </div>
  );
};

export default TechniciansPage;
