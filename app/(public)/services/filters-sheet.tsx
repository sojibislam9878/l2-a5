"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import ServiceFilters from "./service-filters";
import type { ServiceQuery } from "@/lib/services-query";
import type { Category, TechnicianSummary } from "@/lib/types";

const FiltersSheet = ({
  query,
  categories,
  technicians,
  activeCount,
}: {
  query: ServiceQuery;
  categories: Category[];
  technicians: TechnicianSummary[];
  activeCount: number;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="lg:hidden">
          <SlidersHorizontal />
          Filters
          {activeCount > 0 && (
            <span className="ml-1 flex size-5 items-center justify-center rounded-full bg-brand text-[0.7rem] font-semibold text-brand-foreground">
              {activeCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-8">
          <ServiceFilters
            query={query}
            categories={categories}
            technicians={technicians}
            onNavigate={() => setOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default FiltersSheet;
