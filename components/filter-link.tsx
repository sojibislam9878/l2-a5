"use client";

import type { ComponentProps } from "react";
import { useEffect } from "react";
import NextLink, { useLinkStatus } from "next/link";
import { refetchStore } from "@/lib/refetch-store";

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
