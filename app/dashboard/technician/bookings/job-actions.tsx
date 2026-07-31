"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Check, Loader2, PlayCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateJobStatusAction } from "@/lib/actions/technician-bookings";
import type { BookingStatus, TechnicianAction } from "@/lib/types";

type ActionSpec = {
  status: TechnicianAction;
  label: string;
  icon: typeof Check;
  variant: "default" | "destructive";
  brand?: boolean;
};

const actionsFor = (status: BookingStatus): ActionSpec[] => {
  if (status === "pending") {
    return [
      {
        status: "accept",
        label: "Accept",
        icon: Check,
        variant: "default",
        brand: true,
      },
      { status: "decline", label: "Decline", icon: X, variant: "destructive" },
    ];
  }

  if (status === "accept") {
    return [
      {
        status: "in_progress",
        label: "Start job",
        icon: PlayCircle,
        variant: "default",
        brand: true,
      },
    ];
  }

  if (status === "in_progress") {
    return [
      {
        status: "complete",
        label: "Mark completed",
        icon: Check,
        variant: "default",
        brand: true,
      },
    ];
  }

  return [];
};

const JobActions = ({
  bookingId,
  status,
}: {
  bookingId: string;
  status: BookingStatus;
}) => {
  const [isPending, startTransition] = useTransition();
  const [active, setActive] = useState<TechnicianAction | null>(null);
  const actions = actionsFor(status);

  if (actions.length === 0) {
    return null;
  }

  const run = (next: TechnicianAction, label: string) => {
    setActive(next);

    startTransition(async () => {
      const result = await updateJobStatusAction(bookingId, next);
      setActive(null);

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(`${label}: job updated.`);
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <Button
          key={action.status}
          size="sm"
          variant={action.variant}
          disabled={isPending}
          onClick={() => run(action.status, action.label)}
          className={
            action.brand
              ? "bg-brand text-brand-foreground hover:bg-brand/90"
              : undefined
          }
        >
          {isPending && active === action.status ? (
            <Loader2 className="animate-spin" />
          ) : (
            <action.icon />
          )}
          {action.label}
        </Button>
      ))}
    </div>
  );
};

export default JobActions;
