import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { SearchX, ServerCrash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ServiceCard from "@/components/service-card";
import ServiceFilters from "./service-filters";
import FiltersSheet from "./filters-sheet";
import ActiveFilters from "./active-filters";
import { apiRequest } from "@/lib/api-client";
import { getCurrentUser } from "@/lib/dal";
import {
  activeFilterCount,
  parseServiceQuery,
  toSearchString,
  type ServiceQuery,
} from "@/lib/services-query";
import type { Category, Service, TechnicianSummary } from "@/lib/types";

export const metadata: Metadata = {
  title: "Browse services",
  description:
    "Search and filter home services by category, technician and price range.",
};

const ResultsSkeleton = () => (
  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
    {Array.from({ length: 6 }, (_, index) => (
      <div key={index} className="space-y-4 rounded-2xl border bg-card p-5">
        <div className="flex gap-3">
          <Skeleton className="size-10 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex items-center justify-between border-t pt-4">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-7 w-16" />
        </div>
      </div>
    ))}
  </div>
);

const Results = async ({
  query,
  isAuthenticated,
}: {
  query: ServiceQuery;
  isAuthenticated: boolean;
}) => {
  const search = new URLSearchParams();

  if (query.searchTerm) search.set("searchTerm", query.searchTerm);
  if (query.category_id) search.set("category_id", query.category_id);
  if (query.technician_id) search.set("technician_id", query.technician_id);
  if (query.minPrice) search.set("minPrice", query.minPrice);
  if (query.maxPrice) search.set("maxPrice", query.maxPrice);
  search.set("sortBy", query.sortBy);
  search.set("sortOrder", query.sortOrder);

  let services: Service[];

  try {
    services =
      (await apiRequest<Service[]>(`/api/services?${search}`, {
        cache: "no-store",
      })) ?? [];
  } catch {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-16 text-center">
        <ServerCrash className="size-8 text-muted-foreground" />
        <p className="font-medium">Could not load services</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          The server is not responding. Please refresh the page to try again.
        </p>
      </div>
    );
  }

  if (!services.length) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-16 text-center">
        <SearchX className="size-8 text-muted-foreground" />
        <p className="font-medium">No services match your filters</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Try widening your price range, choosing a different category, or
          clearing the search term.
        </p>
        <Button asChild variant="outline" size="sm" className="mt-1">
          <Link href="/services">Clear all filters</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground">{services.length}</span>{" "}
        {services.length === 1 ? "service" : "services"}
      </p>
      <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            isAuthenticated={isAuthenticated}
          />
        ))}
      </div>
    </>
  );
};

const ServicesPage = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const params = await searchParams;
  const query = parseServiceQuery(params);

  const [categories, technicians, user] = await Promise.all([
    apiRequest<Category[]>("/api/categories", { revalidate: 300 }).catch(
      () => [],
    ),
    apiRequest<TechnicianSummary[]>("/api/technicians", {
      revalidate: 300,
    }).catch(() => []),
    getCurrentUser(),
  ]);

  const filterProps = {
    query,
    categories: categories ?? [],
    technicians: technicians ?? [],
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Browse services
        </h1>
        <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
          Filter by category, technician and price to find the right person for
          the job.
        </p>
      </header>

      <div className="mt-8 flex items-center justify-between gap-3 lg:hidden">
        <FiltersSheet {...filterProps} activeCount={activeFilterCount(query)} />
      </div>

      <div className="mt-6 grid gap-8 lg:mt-10 lg:grid-cols-[16rem_1fr] lg:gap-10">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border bg-card p-5">
            <ServiceFilters {...filterProps} />
          </div>
        </aside>

        <section className="min-w-0">
          <div className="mb-5">
            <ActiveFilters {...filterProps} />
          </div>
          <Suspense key={toSearchString(query)} fallback={<ResultsSkeleton />}>
            <Results query={query} isAuthenticated={Boolean(user)} />
          </Suspense>
        </section>
      </div>
    </div>
  );
};

export default ServicesPage;
