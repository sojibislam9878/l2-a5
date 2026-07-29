"use client";

import type { ComponentProps } from "react";
import { useEffect } from "react";
import NextLink, { useLinkStatus } from "next/link";
import { routeProgress } from "@/lib/route-progress";

// useLinkStatus only works inside a Link, so every link carries this reporter and
// feeds one global indicator. Renders no DOM, so it cannot affect any layout.
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
