"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Info, Loader2, Trash2, TriangleAlert } from "lucide-react";
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
import { deleteServiceAction } from "@/lib/actions/services";

const ServiceDeleteButton = ({
  serviceId,
  title,
  bookingCount,
}: {
  serviceId: string;
  title: string;
  bookingCount: number;
}) => {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const booked = bookingCount > 0;

  const run = () => {
    startTransition(async () => {
      const result = await deleteServiceAction(serviceId);

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      setOpen(false);
      toast.success(`"${title}" deleted.`);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Delete ${title}`}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {booked ? (
              <Info className="size-4 text-brand" />
            ) : (
              <TriangleAlert className="size-4 text-destructive" />
            )}
            {booked ? "Cannot delete this service" : "Delete this service?"}
          </DialogTitle>
          <DialogDescription>
            {booked ? (
              <>
                <span className="font-medium text-foreground">{title}</span> has{" "}
                {bookingCount} {bookingCount === 1 ? "booking" : "bookings"}.
                Deleting it would also remove those bookings along with their
                payments and reviews, so it is blocked. You can still edit the
                details instead.
              </>
            ) : (
              <>
                <span className="font-medium text-foreground">{title}</span> has
                no bookings yet, so deleting it is safe. It will disappear from
                the public listings. This cannot be undone.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            {booked ? "Close" : "Cancel"}
          </Button>
          {!booked && (
            <Button variant="destructive" onClick={run} disabled={isPending}>
              {isPending && <Loader2 className="animate-spin" />}
              {isPending ? "Deleting..." : "Yes, delete"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceDeleteButton;
