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
import {
  DEFAULT_TECHNICIAN_SORT,
  TECHNICIAN_SORT_OPTIONS,
  type TechnicianQuery,
} from "@/lib/technicians-query";

const RangeInputs = ({
  label,
  prefix,
  minValue,
  maxValue,
  onMin,
  onMax,
}: {
  label: string;
  prefix?: string;
  minValue: string;
  maxValue: string;
  onMin: (value: string) => void;
  onMax: (value: string) => void;
}) => (
  <div className="space-y-2">
    <p className="text-sm font-medium">{label}</p>
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        {prefix && (
          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
            {prefix}
          </span>
        )}
        <Input
          type="number"
          min={0}
          value={minValue}
          onChange={(event) => onMin(event.target.value)}
          placeholder="Min"
          aria-label={`Minimum ${label.toLowerCase()}`}
          className={prefix ? "pl-7" : undefined}
          suppressHydrationWarning
        />
      </div>
      <span className="text-muted-foreground">–</span>
      <div className="relative flex-1">
        {prefix && (
          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
            {prefix}
          </span>
        )}
        <Input
          type="number"
          min={0}
          value={maxValue}
          onChange={(event) => onMax(event.target.value)}
          placeholder="Max"
          aria-label={`Maximum ${label.toLowerCase()}`}
          className={prefix ? "pl-7" : undefined}
          suppressHydrationWarning
        />
      </div>
    </div>
  </div>
);

const TechnicianFilters = ({
  query,
  allSkills,
  onNavigate,
}: {
  query: TechnicianQuery;
  allSkills: string[];
  onNavigate?: () => void;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(query.searchTerm);
  const [minExperience, setMinExperience] = useState(query.minExperience);
  const [maxExperience, setMaxExperience] = useState(query.maxExperience);
  const [minRate, setMinRate] = useState(query.minRate);
  const [maxRate, setMaxRate] = useState(query.maxRate);

  const push = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }

    router.replace(
      params.toString() ? `/technicians?${params}` : "/technicians",
      { scroll: false },
    );
  };

  useEffect(() => {
    const handle = setTimeout(() => {
      const unchanged =
        searchTerm === (searchParams.get("searchTerm") ?? "") &&
        minExperience === (searchParams.get("minExperience") ?? "") &&
        maxExperience === (searchParams.get("maxExperience") ?? "") &&
        minRate === (searchParams.get("minRate") ?? "") &&
        maxRate === (searchParams.get("maxRate") ?? "");

      if (unchanged) {
        return;
      }

      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries({
        searchTerm,
        minExperience,
        maxExperience,
        minRate,
        maxRate,
      })) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }

      router.replace(
        params.toString() ? `/technicians?${params}` : "/technicians",
        { scroll: false },
      );
    }, 400);

    return () => clearTimeout(handle);
  }, [
    searchTerm,
    minExperience,
    maxExperience,
    minRate,
    maxRate,
    searchParams,
    router,
  ]);

  const clearAll = () => {
    setSearchTerm("");
    setMinExperience("");
    setMaxExperience("");
    setMinRate("");
    setMaxRate("");
    router.replace("/technicians", { scroll: false });
    onNavigate?.();
  };

  const sortValue = `${query.sortBy}:${query.sortOrder}`;
  const hasFilters =
    Boolean(
      searchTerm ||
        minExperience ||
        maxExperience ||
        minRate ||
        maxRate ||
        query.skills,
    ) || sortValue !== DEFAULT_TECHNICIAN_SORT;

  return (
    <div className="space-y-6">
      <Field>
        <FieldLabel htmlFor="technicianSearch">Search</FieldLabel>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="technicianSearch"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Name, email or bio"
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
        <FieldLabel htmlFor="technicianSort">Sort by</FieldLabel>
        <Select
          value={sortValue}
          onValueChange={(value) => {
            const [sortBy, sortOrder] = value.split(":");
            push({ sortBy, sortOrder });
            onNavigate?.();
          }}
        >
          <SelectTrigger id="technicianSort" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TECHNICIAN_SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {allSkills.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Skill</p>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => {
                push({ skills: "" });
                onNavigate?.();
              }}
              className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                query.skills
                  ? "text-muted-foreground hover:border-brand/40"
                  : "border-brand bg-brand/10 text-brand"
              }`}
            >
              Any
            </button>
            {allSkills.map((skill) => {
              const isActive = query.skills === skill;

              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => {
                    push({ skills: isActive ? "" : skill });
                    onNavigate?.();
                  }}
                  className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    isActive
                      ? "border-brand bg-brand/10 text-brand"
                      : "text-muted-foreground hover:border-brand/40 hover:text-foreground"
                  }`}
                >
                  {skill}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <RangeInputs
        label="Experience (years)"
        minValue={minExperience}
        maxValue={maxExperience}
        onMin={setMinExperience}
        onMax={setMaxExperience}
      />

      <RangeInputs
        label="Hourly rate"
        prefix="$"
        minValue={minRate}
        maxValue={maxRate}
        onMin={setMinRate}
        onMax={setMaxRate}
      />

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

export default TechnicianFilters;
