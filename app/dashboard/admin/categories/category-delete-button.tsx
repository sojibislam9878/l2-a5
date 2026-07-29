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
import { deleteCategoryAction } from "@/lib/actions/categories";

const CategoryDeleteButton = ({
  categoryId,
  name,
  serviceCount,
}: {
  categoryId: string;
  name: string;
  serviceCount: number;
}) => {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const inUse = serviceCount > 0;

  const run = () => {
    startTransition(async () => {
      const result = await deleteCategoryAction(categoryId);

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      setOpen(false);
      toast.success(`"${name}" deleted.`);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Delete ${name}`}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {inUse ? (
              <Info className="size-4 text-brand" />
            ) : (
              <TriangleAlert className="size-4 text-destructive" />
            )}
            {inUse ? "Cannot delete this category" : "Delete this category?"}
          </DialogTitle>
          <DialogDescription>
            {inUse ? (
              <>
                <span className="font-medium text-foreground">{name}</span> is
                used by {serviceCount}{" "}
                {serviceCount === 1 ? "service" : "services"}. Deleting it would
                also remove those listings along with their bookings, payments
                and reviews, so it is blocked. Move those services to another
                category first.
              </>
            ) : (
              <>
                <span className="font-medium text-foreground">{name}</span> is
                not used by any service, so deleting it is safe. This cannot be
                undone.
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
            {inUse ? "Close" : "Cancel"}
          </Button>
          {!inUse && (
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

export default CategoryDeleteButton;
