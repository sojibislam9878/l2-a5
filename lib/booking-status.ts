import type { BookingStatus, PaymentStatus } from "./types";

export type DerivedStatus =
  | "requested"
  | "accepted"
  | "paid"
  | "declined"
  | "cancelled"
  | "in_progress"
  | "completed";

export const deriveBookingStatus = (
  status: BookingStatus,
  paymentStatus?: PaymentStatus | null,
): DerivedStatus => {
  if (status === "pending") return "requested";
  if (status === "decline") return "declined";
  if (status === "cancel") return "cancelled";
  if (status === "in_progress") return "in_progress";
  if (status === "complete") return "completed";

  return paymentStatus === "completed" ? "paid" : "accepted";
};

export const isCancellable = (status: BookingStatus) => status === "pending";

export const STATUS_META: Record<
  DerivedStatus,
  { label: string; tone: string; description: string }
> = {
  requested: {
    label: "Requested",
    tone: "bg-amber-500/12 text-amber-600 dark:text-amber-400",
    description: "Waiting for the technician to accept your request.",
  },
  accepted: {
    label: "Accepted",
    tone: "bg-sky-500/12 text-sky-600 dark:text-sky-400",
    description: "Accepted. Payment is due before the job starts.",
  },
  paid: {
    label: "Paid",
    tone: "bg-violet-500/12 text-violet-600 dark:text-violet-400",
    description: "Payment received. The technician will arrive as scheduled.",
  },
  declined: {
    label: "Declined",
    tone: "bg-destructive/12 text-destructive",
    description: "The technician could not take this job.",
  },
  cancelled: {
    label: "Cancelled",
    tone: "bg-muted text-muted-foreground",
    description: "You cancelled this request before it was accepted.",
  },
  in_progress: {
    label: "In progress",
    tone: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
    description: "The technician is working on this job right now.",
  },
  completed: {
    label: "Completed",
    tone: "bg-muted text-muted-foreground",
    description: "This job is finished. You can leave a review.",
  },
};

export const STATUS_ORDER: DerivedStatus[] = [
  "requested",
  "accepted",
  "paid",
  "in_progress",
  "completed",
];
