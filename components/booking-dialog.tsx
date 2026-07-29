"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CalendarPlus, CircleCheck, Loader2, OctagonAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { DAY_LABELS, formatTime, groupByDay } from "@/lib/availability";
import { createBookingAction } from "@/lib/actions/booking";
import { bookingSchema, type BookingInput } from "@/lib/validations/booking";
import type { Availability } from "@/lib/types";

const localMin = () => {
  const now = new Date(Date.now() + 60 * 60 * 1000);
  const offset = now.getTimezoneOffset() * 60 * 1000;

  return new Date(now.getTime() - offset).toISOString().slice(0, 16);
};

const BookingDialog = ({
  serviceId,
  serviceTitle,
  availability,
  size = "lg",
  className = "w-full",
}: {
  serviceId: string;
  serviceTitle: string;
  availability: Availability[];
  size?: "sm" | "lg";
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { scheduled_at: "", address: "", note: "" },
  });

  const schedule = groupByDay(availability);

  const onSubmit = (values: BookingInput) => {
    setFormError(null);
    setNeedsLogin(false);

    startTransition(async () => {
      const result = await createBookingAction(serviceId, values);

      if (!result.ok) {
        setFormError(result.message);
        setNeedsLogin(result.message.includes("sign in"));
        return;
      }

      setCreatedId(result.bookingId);
      reset();
      toast.success("Booking requested. The technician will respond shortly.");
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setFormError(null);
          setNeedsLogin(false);
          setCreatedId(null);
          reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          size={size}
          className={`bg-brand text-brand-foreground hover:bg-brand/90 ${className}`}
        >
          <CalendarPlus />
          Book now
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        {createdId ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <CircleCheck className="size-6" />
            </span>
            <DialogTitle>Booking requested</DialogTitle>
            <DialogDescription className="max-w-sm">
              Your request is pending. Once the technician accepts it, you will
              be able to pay and track progress.
            </DialogDescription>
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => setOpen(false)}
            >
              Done
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Book this service</DialogTitle>
              <DialogDescription className="line-clamp-1">
                {serviceTitle}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <FieldGroup className="gap-5">
                {formError && (
                  <Alert variant="destructive">
                    <OctagonAlert />
                    <AlertDescription className="flex flex-wrap items-center gap-2">
                      {formError}
                      {needsLogin && (
                        <Link
                          href={`/auth/login?redirect=/services/${serviceId}`}
                          className="font-medium underline underline-offset-2"
                        >
                          Sign in
                        </Link>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                <Field data-invalid={Boolean(errors.scheduled_at)}>
                  <FieldLabel htmlFor="scheduled_at">Date and time</FieldLabel>
                  <Input
                    id="scheduled_at"
                    type="datetime-local"
                    min={localMin()}
                    aria-invalid={Boolean(errors.scheduled_at)}
                    {...register("scheduled_at")}
                  />
                  {schedule.length > 0 && (
                    <FieldDescription>
                      Working hours:{" "}
                      {schedule
                        .map(
                          (entry) =>
                            `${DAY_LABELS[entry.day].slice(0, 3)} ${entry.slots
                              .map(
                                (slot) =>
                                  `${formatTime(slot.start_time)}–${formatTime(slot.end_time)}`,
                              )
                              .join(", ")}`,
                        )
                        .join(" · ")}
                    </FieldDescription>
                  )}
                  <FieldError errors={[errors.scheduled_at]} />
                </Field>

                <Field data-invalid={Boolean(errors.address)}>
                  <FieldLabel htmlFor="address">Service address</FieldLabel>
                  <Input
                    id="address"
                    autoComplete="street-address"
                    placeholder="123 Main Street, Dhaka"
                    aria-invalid={Boolean(errors.address)}
                    {...register("address")}
                  />
                  <FieldError errors={[errors.address]} />
                </Field>

                <Field data-invalid={Boolean(errors.note)}>
                  <FieldLabel htmlFor="note">Note (optional)</FieldLabel>
                  <Textarea
                    id="note"
                    rows={3}
                    placeholder="Anything the technician should know before arriving"
                    aria-invalid={Boolean(errors.note)}
                    {...register("note")}
                  />
                  <FieldError errors={[errors.note]} />
                </Field>

                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-brand text-brand-foreground hover:bg-brand/90"
                >
                  {isPending && <Loader2 className="animate-spin" />}
                  {isPending ? "Sending request..." : "Request booking"}
                </Button>
              </FieldGroup>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
