"use client";

import type { ComponentProps } from "react";
import { useEffect } from "react";
// Deliberately NOT @/components/link: that reports to routeProgress, and a filter
// chip firing both the page bar and the skeleton is two signals for one action.
// The skeleton is the precise feedback here, so this opts out of the global bar.
import NextLink, { useLinkStatus } from "next/link";
import { refetchStore } from "@/lib/refetch-store";

// Admin filter chips are real links, so there is no router.replace to wrap.
// useLinkStatus gives the same pending window from inside the Link.
const RefetchReporter = () => {
  const { pending } = useLinkStatus();

  useEffect(() => {
    if (!pending) return;

    refetchStore.start();

    return () => refetchStore.stop();
  }, [pending]);

  return null;
};

const FilterLink = ({ children, ...props }: ComponentProps<typeof NextLink>) => (
  <NextLink {...props}>
    {children}
    <RefetchReporter />
  </NextLink>
);

export default FilterLink;
