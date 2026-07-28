import { z } from "zod";
import { WEEKDAYS } from "@/lib/availability";

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

const slotSchema = z.object({
  day: z.enum(WEEKDAYS as [string, ...string[]]),
  start_time: z.string().regex(TIME, "Use HH:MM"),
  end_time: z.string().regex(TIME, "Use HH:MM"),
});

export const availabilitySchema = z.object({
  slots: z
    .array(slotSchema)
    .max(50, "That is too many time blocks")
    .superRefine((slots, ctx) => {
      slots.forEach((slot, index) => {
        if (slot.start_time >= slot.end_time) {
          ctx.addIssue({
            code: "custom",
            path: [index, "end_time"],
            message: "End must be after start",
          });
        }
      });

      const byDay = new Map<string, { index: number; slot: typeof slots[number] }[]>();

      slots.forEach((slot, index) => {
        const entries = byDay.get(slot.day) ?? [];
        entries.push({ index, slot });
        byDay.set(slot.day, entries);
      });

      for (const entries of byDay.values()) {
        const sorted = [...entries].sort((a, b) =>
          a.slot.start_time.localeCompare(b.slot.start_time),
        );

        for (let i = 1; i < sorted.length; i += 1) {
          if (sorted[i].slot.start_time < sorted[i - 1].slot.end_time) {
            ctx.addIssue({
              code: "custom",
              path: [sorted[i].index, "start_time"],
              message: "Overlaps another block on this day",
            });
          }
        }
      }
    }),
});

export type AvailabilityInput = z.infer<typeof availabilitySchema>;
