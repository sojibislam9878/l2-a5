import type { Metadata } from "next";
import Link from "@/components/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusPage from "@/components/status-page";

export const metadata: Metadata = {
  title: "Not found",
};

const DashboardNotFound = () => {
  return (
    <StatusPage
      icon={FileQuestion}
      code="404"
      title="Not found"
      description="This record doesn't exist, or it isn't yours to view. It may have been removed."
    >
      <Button
        asChild
        className="flex-1 bg-brand text-brand-foreground hover:bg-brand/90"
      >
        <Link href="/dashboard">Back to dashboard</Link>
      </Button>
    </StatusPage>
  );
};

export default DashboardNotFound;
