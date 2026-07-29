import type { Metadata } from "next";
import Link from "next/link";
import { CircleSlash } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Payment cancelled",
  description: "Your FixItNow payment was not completed.",
};

const PaymentCancelPage = () => {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-5 px-4 py-20 text-center sm:px-6">
      <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <CircleSlash className="size-7" />
      </span>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Payment cancelled
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          You were not charged. Your booking is still accepted, so you can pay
          whenever you are ready.
        </p>
      </div>

      <div className="flex w-full flex-col gap-2 sm:flex-row">
        <Button
          asChild
          className="flex-1 bg-brand text-brand-foreground hover:bg-brand/90"
        >
          <Link href="/dashboard/customer/bookings">Back to my bookings</Link>
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </div>
  );
};

export default PaymentCancelPage;
