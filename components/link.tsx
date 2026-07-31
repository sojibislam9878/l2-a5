"use client";

import type { ComponentProps } from "react";
import { useEffect } from "react";
import NextLink, { useLinkStatus } from "next/link";
import { routeProgress } from "@/lib/route-progress";

const PendingReporter = () => {
  const { pending } = useLinkStatus();

  useEffect(() => {
    if (!pending) return;

    routeProgress.start();

    return () => routeProgress.stop();
  }, [pending]);

  return null;
};

const Link = ({ children, ...props }: ComponentProps<typeof NextLink>) => (
  <NextLink {...props}>
    {children}
    <PendingReporter />
  </NextLink>
);

export default Link;
