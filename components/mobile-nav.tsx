"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { isActivePath, type NavLink } from "@/lib/nav-links";

const MobileNav = ({
  links,
  isAuthenticated,
}: {
  links: NavLink[];
  isAuthenticated: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open menu"
        >
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 max-w-[85vw] p-0">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle className="flex items-center gap-2 text-base">
            <span className="flex size-7 items-center justify-center rounded-lg bg-brand text-brand-foreground">
              <Wrench className="size-3.5" />
            </span>
            FixItNow
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-3 py-4">
          {links.map((link) => {
            const active = isActivePath(pathname, link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-brand/10 text-brand"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        {!isAuthenticated && (
          <div className="mt-auto flex flex-col gap-2 border-t px-5 py-4">
            <Button asChild variant="outline">
              <Link href="/auth/login" onClick={() => setOpen(false)}>
                Sign in
              </Link>
            </Button>
            <Button
              asChild
              className="bg-brand text-brand-foreground hover:bg-brand/90"
            >
              <Link href="/auth/register" onClick={() => setOpen(false)}>
                Get started
              </Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
