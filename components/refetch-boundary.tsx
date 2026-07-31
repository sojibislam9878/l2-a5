"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useSyncExternalStore, useTransition } from "react";
import { refetchStore } from "@/lib/refetch-store";

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
