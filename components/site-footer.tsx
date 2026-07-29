import Link from "@/components/link";
import { Wrench } from "lucide-react";

const SiteFooter = () => {
  return (
    <footer className="border-t">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold">
          <span className="flex size-6 items-center justify-center rounded-md bg-brand text-brand-foreground">
            <Wrench className="size-3" />
          </span>
          FixItNow
        </Link>
        <p className="text-sm text-muted-foreground">
          Your trusted home service platform.
        </p>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/services" className="transition-colors hover:text-foreground">
            Services
          </Link>
          <Link
            href="/technicians"
            className="transition-colors hover:text-foreground"
          >
            Technicians
          </Link>
        </nav>
      </div>
    </footer>
  );
};

export default SiteFooter;
