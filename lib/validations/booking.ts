import { z } from "zod";

export const bookingSchema = z.object({
  scheduled_at: z
    .string()
    .min(1, "Choose a date and time")
    .refine((value) => !Number.isNaN(new Date(value).getTime()), {
      message: "Choose a valid date and time",
    })
    .refine((value) => new Date(value).getTime() > Date.now(), {
      message: "Pick a time in the future",
    }),
  address: z
    .string()
    .trim()
    .min(10, "Enter the full address so the technician can find you")
    .max(255, "Address must be 255 characters or fewer"),
  note: z
    .string()
    .trim()
    .max(500, "Note must be 500 characters or fewer")
    .optional(),
});

export type BookingInput = z.infer<typeof bookingSchema>;
