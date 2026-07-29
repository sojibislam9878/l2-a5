"use client";

import { useState, useTransition } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { startPaymentAction } from "@/lib/actions/payments";

const PayButton = ({
  bookingId,
  size = "sm",
  className = "",
  label = "Pay now",
}: {
  bookingId: string;
  size?: "sm" | "lg";
  className?: string;
  label?: string;
}) => {
  const [isPending, startTransition] = useTransition();
  const [redirecting, setRedirecting] = useState(false);

  const onClick = () => {
    startTransition(async () => {
      const result = await startPaymentAction(bookingId);

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      setRedirecting(true);
      window.location.href = result.url;
    });
  };

  const busy = isPending || redirecting;

  return (
    <Button
      size={size}
      disabled={busy}
      onClick={onClick}
      className={`bg-brand text-brand-foreground hover:bg-brand/90 ${className}`}
    >
      {busy ? <Loader2 className="animate-spin" /> : <CreditCard />}
      {redirecting ? "Redirecting..." : busy ? "Starting..." : label}
    </Button>
  );
};

export default PayButton;
