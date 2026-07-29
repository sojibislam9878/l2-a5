import Link from "next/link";
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
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:px-6">
        {/* Equal-basis side groups keep the nav centred regardless of their widths. */}
        <div className="flex flex-1 items-center gap-3">
          <MobileNav links={PUBLIC_LINKS} isAuthenticated={Boolean(user)} />

          <Link
            href="/"
            className="flex items-center gap-2 font-semibold tracking-tight"
          >
            <span className="flex size-8 items-center justify-center rounded-xl bg-brand text-brand-foreground shadow-sm shadow-brand/25">
              <Wrench className="size-4" />
            </span>
            FixItNow
          </Link>
        </div>

        <MainNav links={PUBLIC_LINKS} />

        <div className="flex flex-1 items-center justify-end gap-1.5">
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
                <Link href="/auth/register">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;
