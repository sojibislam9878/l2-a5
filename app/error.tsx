"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CircleAlert, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusPage from "@/components/status-page";

const ErrorBoundary = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusPage
      icon={CircleAlert}
      tone="destructive"
      title="Something went wrong"
      description="We hit an unexpected error loading this page. Trying again usually fixes it."
    >
      <Button
        onClick={reset}
        className="flex-1 bg-brand text-brand-foreground hover:bg-brand/90"
      >
        <RotateCcw />
        Try again
      </Button>
      <Button asChild variant="outline" className="flex-1">
        <Link href="/">Go home</Link>
      </Button>
    </StatusPage>
  );
};

export default ErrorBoundary;
