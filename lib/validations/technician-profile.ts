import { z } from "zod";

export const technicianProfileSchema = z.object({
  bio: z
    .string()
    .trim()
    .max(2000, "Bio must be 2000 characters or fewer"),
  skills: z
    .array(z.string().trim().min(1).max(60, "Each skill must be 60 characters or fewer"))
    .max(30, "You can list up to 30 skills"),
  experience_year: z
    .string()
    .trim()
    .refine(
      (value) =>
        value === "" ||
        (/^\d+$/.test(value) && Number(value) >= 0 && Number(value) <= 70),
      "Enter a whole number of years between 0 and 70",
    ),
  hourly_rate: z
    .string()
    .trim()
    .refine(
      (value) =>
        value === "" ||
        (/^\d+(\.\d{1,2})?$/.test(value) && Number(value) <= 999999.99),
      "Enter a rate up to 999999.99, with at most 2 decimals",
    ),
});

export type TechnicianProfileInput = z.infer<typeof technicianProfileSchema>;
