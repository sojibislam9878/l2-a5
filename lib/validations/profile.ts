import { z } from "zod";

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(255, "Name must be 255 characters or fewer"),
  phone_no: z
    .string()
    .trim()
    .max(20, "Phone number must be 20 characters or fewer")
    .regex(/^$|^[+\d][\d\s-]*$/, "Only digits, spaces and dashes are allowed"),
});

export type ProfileInput = z.infer<typeof profileSchema>;
