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

// Profile lives at the root of each role's namespace, so its href is
// role-dependent and must match exactly (or it highlights on every sub-route).
const accountItems = (role: Role): NavItem[] => [
  { href: `/dashboard/${role}`, label: "Profile", icon: UserRound, exact: true },
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
    href: "/dashboard/technician/overview",
    label: "Overview",
    icon: LayoutDashboard,
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
  {
    href: "/dashboard/admin/overview",
    label: "Overview",
    icon: LayoutDashboard,
  },
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

  const sections = [
    { label: "Account", items: accountItems(role) },
    ...contextSections,
  ];

  const isActive = (item: NavItem) =>
    item.exact
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <div key={section.label}>
          <p className="px-2 text-[0.7rem] font-semibold tracking-wider text-muted-foreground/80 uppercase">
            {section.label}
          </p>
          <nav className="mt-2 flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
            {section.items.map((item) => {
              const active = isActive(item);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`group flex shrink-0 items-center gap-2.5 rounded-xl py-1.5 pr-3 pl-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-brand/10 text-brand"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <span
                    className={`flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      active
                        ? "bg-brand text-brand-foreground shadow-sm shadow-brand/25"
                        : "bg-muted text-muted-foreground group-hover:text-foreground"
                    }`}
                  >
                    <item.icon className="size-3.5" />
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      ))}
    </div>
  );
};

export default DashboardNav;
