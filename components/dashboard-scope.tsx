"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const options = [
  { href: "/dashboard", label: "Customer & Technician" },
  { href: "/dashboard/customer/bookings", label: "Customer" },
  { href: "/dashboard/technician/overview", label: "Technician" },
];

const resolveActive = (pathname: string) => {
  if (pathname.startsWith("/dashboard/customer")) {
    return "/dashboard/customer/bookings";
  }

  if (pathname.startsWith("/dashboard/technician")) {
    return "/dashboard/technician/overview";
  }

  return "/dashboard";
};

const DashboardScope = () => {
  const pathname = usePathname();
  const active = resolveActive(pathname);

  return (
    <div
      role="radiogroup"
      aria-label="Dashboard view"
      className="grid gap-1.5 rounded-xl border bg-muted/40 p-1.5 sm:grid-cols-3"
    >
      {options.map((option) => {
        const isActive = option.href === active;

        return (
          <Link
            key={option.href}
            href={option.href}
            role="radio"
            aria-checked={isActive}
            className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span
              aria-hidden
              className={`flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                isActive ? "border-brand" : "border-muted-foreground/40"
              }`}
            >
              {isActive && <span className="size-2 rounded-full bg-brand" />}
            </span>
            <span className="truncate">{option.label}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default DashboardScope;
