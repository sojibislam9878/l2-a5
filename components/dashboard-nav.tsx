"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarCheck,
  CalendarClock,
  ClipboardList,
  FolderTree,
  LayoutDashboard,
  UserRound,
  Users,
  Wallet,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/lib/types";

type NavItem = { href: string; label: string; icon: LucideIcon; exact?: boolean };

const ACCOUNT: NavItem[] = [
  { href: "/dashboard/profile", label: "Profile", icon: UserRound },
];

const CUSTOMER: NavItem[] = [
  {
    href: "/dashboard/customer/bookings",
    label: "My bookings",
    icon: CalendarCheck,
  },
  {
    href: "/dashboard/customer/payments",
    label: "My payments",
    icon: Wallet,
  },
];

const TECHNICIAN: NavItem[] = [
  {
    href: "/dashboard/technician",
    label: "Overview",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/dashboard/technician/bookings",
    label: "Job requests",
    icon: ClipboardList,
  },
  { href: "/dashboard/technician/services", label: "My services", icon: Wrench },
  {
    href: "/dashboard/technician/profile",
    label: "Service profile",
    icon: UserRound,
  },
  {
    href: "/dashboard/technician/availability",
    label: "Availability",
    icon: CalendarClock,
  },
];

const ADMIN: NavItem[] = [
  { href: "/dashboard/admin/users", label: "All users", icon: Users },
  {
    href: "/dashboard/admin/bookings",
    label: "All bookings",
    icon: CalendarCheck,
  },
  {
    href: "/dashboard/admin/categories",
    label: "Categories",
    icon: FolderTree,
  },
];

const DashboardNav = ({ role }: { role: Role }) => {
  const pathname = usePathname();

  const both = [
    { label: "Customer", items: CUSTOMER },
    { label: "Technician", items: TECHNICIAN },
  ];

  const contextSections =
    role === "admin"
      ? [{ label: "Admin", items: ADMIN }]
      : role !== "technician"
        ? [{ label: "Customer", items: CUSTOMER }]
        : pathname.startsWith("/dashboard/customer")
          ? [{ label: "Customer", items: CUSTOMER }]
          : pathname.startsWith("/dashboard/technician")
            ? [{ label: "Technician", items: TECHNICIAN }]
            : both;

  const sections = [{ label: "Account", items: ACCOUNT }, ...contextSections];

  const isActive = (item: NavItem) =>
    item.exact
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <aside className="space-y-5 lg:sticky lg:top-24 lg:h-fit">
      {sections.map((section) => (
        <div key={section.label}>
          <p className="px-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {section.label}
          </p>
          <nav className="mt-2 flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            {section.items.map((item) => {
              const active = isActive(item);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active
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
        </div>
      ))}
    </aside>
  );
};

export default DashboardNav;
