"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CalendarX, Loader2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cancelBookingAction } from "@/lib/actions/booking";

const CancelBookingButton = ({
  bookingId,
  serviceTitle,
  size = "sm",
  className = "",
}: {
  bookingId: string;
  serviceTitle: string;
  size?: "sm" | "default";
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const run = () => {
    startTransition(async () => {
      const result = await cancelBookingAction(bookingId);

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      setOpen(false);
      toast.success("Booking cancelled.");
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={size} variant="outline" className={className}>
          <CalendarX />
          Cancel booking
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TriangleAlert className="size-4 text-destructive" />
            Cancel this booking?
          </DialogTitle>
          <DialogDescription>
            Your request for{" "}
            <span className="font-medium text-foreground">{serviceTitle}</span>{" "}
            will be withdrawn and the technician will no longer be able to accept
            it. You were not charged, and you can book the service again at any
            time.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Keep booking
          </Button>
          <Button variant="destructive" onClick={run} disabled={isPending}>
            {isPending && <Loader2 className="animate-spin" />}
            {isPending ? "Cancelling..." : "Yes, cancel"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancelBookingButton;
