export type NavLink = { href: string; label: string };

export const PUBLIC_LINKS: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/technicians", label: "Technicians" },
];

// A detail page keeps its section highlighted, so /services/[id] still marks Services.
// "/" is exact-only — as a prefix it would match every route.
export const isActivePath = (pathname: string, href: string) =>
  href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);
