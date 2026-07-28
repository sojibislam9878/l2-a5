"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { visualForCategory } from "@/lib/category-visuals";
import {
  DEFAULT_SORT,
  SORT_OPTIONS,
  type ServiceQuery,
} from "@/lib/services-query";
import type { Category, TechnicianSummary } from "@/lib/types";

const ALL = "all";

type Props = {
  query: ServiceQuery;
  categories: Category[];
  technicians: TechnicianSummary[];
  onNavigate?: () => void;
};

const ServiceFilters = ({
  query,
  categories,
  technicians,
  onNavigate,
}: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(query.searchTerm);
  const [minPrice, setMinPrice] = useState(query.minPrice);
  const [maxPrice, setMaxPrice] = useState(query.maxPrice);

  const push = (updates: Partial<Record<string, string>>) => {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }

    router.replace(params.toString() ? `/services?${params}` : "/services", {
      scroll: false,
    });
  };

  useEffect(() => {
    const handle = setTimeout(() => {
      const unchanged =
        searchTerm === (searchParams.get("searchTerm") ?? "") &&
        minPrice === (searchParams.get("minPrice") ?? "") &&
        maxPrice === (searchParams.get("maxPrice") ?? "");

      if (unchanged) {
        return;
      }

      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries({
        searchTerm,
        minPrice,
        maxPrice,
      })) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }

      router.replace(params.toString() ? `/services?${params}` : "/services", {
        scroll: false,
      });
    }, 400);

    return () => clearTimeout(handle);
  }, [searchTerm, minPrice, maxPrice, searchParams, router]);

  const clearAll = () => {
    setSearchTerm("");
    setMinPrice("");
    setMaxPrice("");
    router.replace("/services", { scroll: false });
    onNavigate?.();
  };

  const sortValue = `${query.sortBy}:${query.sortOrder}`;
  const hasFilters =
    Boolean(
      searchTerm ||
        minPrice ||
        maxPrice ||
        query.category_id ||
        query.technician_id,
    ) || sortValue !== DEFAULT_SORT;

  return (
    <div className="space-y-6">
      <Field>
        <FieldLabel htmlFor="searchTerm">Search</FieldLabel>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="searchTerm"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Service, category or technician"
            className="pl-9"
            suppressHydrationWarning
          />
          {searchTerm && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Clear search"
              className="absolute top-1/2 right-1 -translate-y-1/2 text-muted-foreground"
              onClick={() => setSearchTerm("")}
            >
              <X />
            </Button>
          )}
        </div>
      </Field>

      <Field>
        <FieldLabel htmlFor="sort">Sort by</FieldLabel>
        <Select
          value={sortValue}
          onValueChange={(value) => {
            const [sortBy, sortOrder] = value.split(":");
            push({ sortBy, sortOrder });
            onNavigate?.();
          }}
        >
          <SelectTrigger id="sort" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <div className="space-y-2">
        <p className="text-sm font-medium">Category</p>
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => {
              push({ category_id: "" });
              onNavigate?.();
            }}
            className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
              query.category_id
                ? "text-muted-foreground hover:bg-accent"
                : "bg-brand/10 font-medium text-brand"
            }`}
          >
            All categories
          </button>
          {categories.map((category) => {
            const { icon: Icon, tint } = visualForCategory(category.name);
            const isActive = query.category_id === category.id;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => {
                  push({ category_id: category.id });
                  onNavigate?.();
                }}
                className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                  isActive
                    ? "bg-brand/10 font-medium text-brand"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <span
                  className={`flex size-6 shrink-0 items-center justify-center rounded-md ${tint}`}
                >
                  <Icon className="size-3.5" />
                </span>
                <span className="truncate">{category.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Field>
        <FieldLabel htmlFor="technician">Technician</FieldLabel>
        <Select
          value={query.technician_id || ALL}
          onValueChange={(value) => {
            push({ technician_id: value === ALL ? "" : value });
            onNavigate?.();
          }}
        >
          <SelectTrigger id="technician" className="w-full">
            <SelectValue placeholder="Any technician" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Any technician</SelectItem>
            {technicians.map((technician) => (
              <SelectItem key={technician.id} value={technician.id}>
                {technician.user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <div className="space-y-2">
        <p className="text-sm font-medium">Price range</p>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
              $
            </span>
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              placeholder="Min"
              aria-label="Minimum price"
              className="pl-7"
              suppressHydrationWarning
            />
          </div>
          <span className="text-muted-foreground">–</span>
          <div className="relative flex-1">
            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
              $
            </span>
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              placeholder="Max"
              aria-label="Maximum price"
              className="pl-7"
              suppressHydrationWarning
            />
          </div>
        </div>
      </div>

      {hasFilters && (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={clearAll}
        >
          <X />
          Clear all filters
        </Button>
      )}
    </div>
  );
};

export default ServiceFilters;
