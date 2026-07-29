"use client";

import { useEffect } from "react";
import Link from "@/components/link";
import { CircleAlert, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusPage from "@/components/status-page";

const PublicError = ({
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
      title="This page didn't load"
      description="Something went wrong fetching this page. The server may be briefly unavailable."
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

export default PublicError;
