"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, UserRound } from "lucide-react";
import type { Role } from "@/lib/types";

const items: {
  href: string;
  label: string;
  icon: typeof UserRound;
  roles?: Role[];
}[] = [
  { href: "/dashboard/profile", label: "Profile", icon: UserRound },
  {
    href: "/dashboard/bookings",
    label: "My bookings",
    icon: CalendarCheck,
    roles: ["customer", "technician"],
  },
];

const roleLabels: Record<Role, string> = {
  customer: "Customer account",
  technician: "Technician account",
  admin: "Admin account",
};

const DashboardNav = ({ role }: { role: Role }) => {
  const pathname = usePathname();
  const visible = items.filter((item) => !item.roles || item.roles.includes(role));

  return (
    <aside className="lg:sticky lg:top-24 lg:h-fit">
      <p className="px-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Account
      </p>
      <nav className="mt-2 flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
        {visible.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand/10 text-brand"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <p className="mt-4 hidden px-3 text-xs text-muted-foreground lg:block">
        {roleLabels[role]}
      </p>
    </aside>
  );
};

export default DashboardNav;
