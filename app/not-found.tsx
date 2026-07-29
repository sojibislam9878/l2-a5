import type { Metadata } from "next";
import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusPage from "@/components/status-page";

export const metadata: Metadata = {
  title: "Page not found",
};

const NotFound = () => {
  return (
    <StatusPage
      icon={FileQuestion}
      code="404"
      title="Page not found"
      description="That page does not exist, or it may have moved. Check the address or head back to browsing."
    >
      <Button
        asChild
        className="flex-1 bg-brand text-brand-foreground hover:bg-brand/90"
      >
        <Link href="/">Go home</Link>
      </Button>
      <Button asChild variant="outline" className="flex-1">
        <Link href="/services">Browse services</Link>
      </Button>
    </StatusPage>
  );
};

export default NotFound;
