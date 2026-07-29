"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CircleCheck, CircleSlash, Loader2, TriangleAlert } from "lucide-react";
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
import { updateUserStatusAction } from "@/lib/actions/admin-users";
import type { ActiveStatus } from "@/lib/types";

const UserStatusButton = ({
  userId,
  name,
  status,
  size = "sm",
  className = "",
}: {
  userId: string;
  name: string;
  status: ActiveStatus;
  size?: "sm" | "lg";
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const banning = status === "unban";
  const next: ActiveStatus = banning ? "ban" : "unban";

  const run = () => {
    startTransition(async () => {
      const result = await updateUserStatusAction(userId, next);

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      setOpen(false);
      toast.success(
        banning ? `${name} has been banned.` : `${name} has been unbanned.`,
      );
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size={size}
          variant={banning ? "destructive" : "outline"}
          className={className}
        >
          {banning ? <CircleSlash /> : <CircleCheck />}
          {banning ? "Ban" : "Unban"}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {banning ? (
              <TriangleAlert className="size-4 text-destructive" />
            ) : (
              <CircleCheck className="size-4 text-emerald-500" />
            )}
            {banning ? "Ban this user?" : "Unban this user?"}
          </DialogTitle>
          <DialogDescription>
            {banning ? (
              <>
                <span className="font-medium text-foreground">{name}</span> will
                be blocked from every action — browsing stays possible, but they
                cannot book, pay, review, or manage jobs until you unban them.
              </>
            ) : (
              <>
                <span className="font-medium text-foreground">{name}</span> will
                regain full access to their account immediately.
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
            Cancel
          </Button>
          <Button
            variant={banning ? "destructive" : "default"}
            onClick={run}
            disabled={isPending}
            className={
              banning ? undefined : "bg-brand text-brand-foreground hover:bg-brand/90"
            }
          >
            {isPending && <Loader2 className="animate-spin" />}
            {isPending ? "Saving..." : banning ? "Yes, ban" : "Yes, unban"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserStatusButton;
