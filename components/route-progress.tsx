"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { routeProgress } from "@/lib/route-progress";

const RouteProgress = () => {
  const pending = useSyncExternalStore(
    routeProgress.subscribe,
    routeProgress.isPending,
    routeProgress.serverSnapshot,
  );

  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    routeProgress.reset();
  }, [pathname, searchParams]);

  if (!pending) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-0 z-100"
    >
      <span className="sr-only">Loading page</span>

      <div className="h-0.5 w-full overflow-hidden bg-brand/15">
        <div className="route-progress-bar h-full w-2/5 bg-brand" />
      </div>

      <div className="mt-19 flex justify-center px-4">
        <span className="route-progress-pill flex items-center gap-2 rounded-full border bg-card/95 py-1.5 pr-3.5 pl-2.5 text-xs font-medium shadow-lg shadow-black/5 backdrop-blur dark:shadow-black/40">
          <Loader2 className="size-3.5 animate-spin text-brand" />
          Loading
        </span>
      </div>
    </div>
  );
};

export default RouteProgress;
