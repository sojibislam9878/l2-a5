import type { Metadata } from "next";
import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusPage from "@/components/status-page";

export const metadata: Metadata = {
  title: "Not found",
};

const PublicNotFound = () => {
  return (
    <StatusPage
      icon={SearchX}
      code="404"
      title="We couldn't find that"
      description="The service or technician you're looking for may have been removed, or the link is wrong."
    >
      <Button
        asChild
        className="flex-1 bg-brand text-brand-foreground hover:bg-brand/90"
      >
        <Link href="/services">Browse services</Link>
      </Button>
      <Button asChild variant="outline" className="flex-1">
        <Link href="/technicians">Browse technicians</Link>
      </Button>
    </StatusPage>
  );
};

export default PublicNotFound;
