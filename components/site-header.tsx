import Link from "@/components/link";
import { Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/theme-toggle";
import UserMenu from "@/components/user-menu";
import MainNav from "@/components/main-nav";
import MobileNav from "@/components/mobile-nav";
import { getCurrentUser } from "@/lib/dal";
import { PUBLIC_LINKS } from "@/lib/nav-links";

const SiteHeader = async () => {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-2 px-4 sm:gap-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-1 sm:gap-2 md:flex-1">
          <MobileNav links={PUBLIC_LINKS} isAuthenticated={Boolean(user)} />

          <Link
            href="/"
            className="flex min-w-0 items-center gap-2 font-semibold tracking-tight"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-brand text-brand-foreground shadow-sm shadow-brand/25">
              <Wrench className="size-4" />
            </span>
            <span className="truncate">FixItNow</span>
          </Link>
        </div>

        <MainNav links={PUBLIC_LINKS} />

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-1.5 md:ml-0 md:flex-1 md:justify-end">
          <ThemeToggle />
          {user ? (
            <UserMenu user={user} />
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
                <Link href="/auth/login">Sign in</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="bg-brand text-brand-foreground hover:bg-brand/90"
              >
                <Link href="/auth/register">
                  <span className="hidden min-[420px]:inline">Get started</span>
                  <span className="min-[420px]:hidden">Sign up</span>
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;
