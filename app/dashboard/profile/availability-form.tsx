"use client";

import { useState, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, OctagonAlert, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { updateAvailabilityAction } from "@/lib/actions/availability";
import { DAY_LABELS, WEEKDAYS } from "@/lib/availability";
import {
  availabilitySchema,
  type AvailabilityInput,
} from "@/lib/validations/availability";
import type { Availability } from "@/lib/types";

const toFormSlots = (availability: Availability[]) =>
  availability.map((slot) => ({
    day: slot.day as string,
    start_time: slot.start_time,
    end_time: slot.end_time,
  }));

const AvailabilityForm = ({
  availability,
}: {
  availability: Availability[];
}) => {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<AvailabilityInput>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: { slots: toFormSlots(availability) },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "slots" });

  const onSubmit = (values: AvailabilityInput) => {
    setFormError(null);

    startTransition(async () => {
      const result = await updateAvailabilityAction(values);

      if (!result.ok) {
        setFormError(result.message);
        return;
      }

      reset({ slots: toFormSlots(result.availability) });
      toast.success("Weekly availability updated.");
    });
  };

  const totalBlocks = fields.length;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {formError && (
        <Alert variant="destructive">
          <OctagonAlert />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <div className="divide-y rounded-xl border">
        {WEEKDAYS.map((day) => {
          const entries = fields
            .map((field, index) => ({ field, index }))
            .filter((entry) => entry.field.day === day);

          return (
            <div
              key={day}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:gap-4"
            >
              <div className="flex items-center justify-between gap-3 sm:w-32 sm:shrink-0">
                <p className="text-sm font-medium">{DAY_LABELS[day]}</p>
                {entries.length === 0 && (
                  <span className="text-xs text-muted-foreground sm:hidden">
                    Closed
                  </span>
                )}
              </div>

              <div className="flex-1 space-y-2">
                {entries.length === 0 ? (
                  <p className="hidden text-sm text-muted-foreground sm:block">
                    Closed
                  </p>
                ) : (
                  entries.map(({ field, index }) => {
                    const slotErrors = errors.slots?.[index];

                    return (
                      <div key={field.id} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Input
                            type="time"
                            aria-label={`${DAY_LABELS[day]} start time`}
                            aria-invalid={Boolean(slotErrors?.start_time)}
                            className="w-full sm:w-32"
                            {...register(`slots.${index}.start_time`)}
                          />
                          <span className="text-muted-foreground">–</span>
                          <Input
                            type="time"
                            aria-label={`${DAY_LABELS[day]} end time`}
                            aria-invalid={Boolean(slotErrors?.end_time)}
                            className="w-full sm:w-32"
                            {...register(`slots.${index}.end_time`)}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Remove ${DAY_LABELS[day]} time block`}
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => remove(index)}
                          >
                            <Trash2 />
                          </Button>
                        </div>
                        {(slotErrors?.start_time || slotErrors?.end_time) && (
                          <p
                            role="alert"
                            className="text-xs font-medium text-destructive"
                          >
                            {slotErrors.start_time?.message ??
                              slotErrors.end_time?.message}
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="sm:shrink-0"
                onClick={() =>
                  append({
                    day,
                    start_time: "09:00",
                    end_time: "17:00",
                  })
                }
              >
                <Plus />
                Add hours
              </Button>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t pt-5">
        <Button
          type="submit"
          disabled={isPending || !isDirty}
          className="bg-brand text-brand-foreground hover:bg-brand/90"
        >
          {isPending ? <Loader2 className="animate-spin" /> : <Save />}
          {isPending ? "Saving..." : "Save availability"}
        </Button>
        {isDirty && !isPending && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              reset();
              setFormError(null);
            }}
          >
            Discard
          </Button>
        )}
        <p className="text-xs text-muted-foreground">
          {totalBlocks === 0
            ? "No hours set — customers cannot book you."
            : `${totalBlocks} time ${totalBlocks === 1 ? "block" : "blocks"} across the week.`}
        </p>
      </div>
    </form>
  );
};

export default AvailabilityForm;
