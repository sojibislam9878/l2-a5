"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useSyncExternalStore, useTransition } from "react";
import { refetchStore } from "@/lib/refetch-store";

/**
 * Swaps a server-rendered list for a skeleton while a filter/search navigation
 * is in flight.
 *
 * The keyed <Suspense> on these pages only covers the first render: router.replace
 * commits the new URL once the RSC payload arrives, so the new key never exists
 * during the pending window and no fallback is ever shown. This boundary reads
 * client-side pending state instead, which is available the moment the user acts.
 */
const RefetchBoundary = ({
  fallback,
  children,
}: {
  fallback: ReactNode;
  children: ReactNode;
}) => {
  const pending = useSyncExternalStore(
    refetchStore.subscribe,
    refetchStore.isPending,
    refetchStore.serverSnapshot,
  );

  if (!pending) return children;

  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">Loading results</span>
      {fallback}
    </div>
  );
};

/** Wraps a router.replace so every RefetchBoundary on the page shows its skeleton. */
export const useRefetchTransition = () => {
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isPending) return;

    refetchStore.start();

    return () => refetchStore.stop();
  }, [isPending]);

  return useCallback(
    (navigate: () => void) => startTransition(navigate),
    [startTransition],
  );
};

export default RefetchBoundary;
