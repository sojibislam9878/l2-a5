import { z } from "zod";

export const reviewSchema = z.object({
  rating: z
    .number()
    .int("Choose a whole number of stars")
    .min(1, "Choose a rating")
    .max(5, "Rating cannot be more than 5"),
  comment: z
    .string()
    .trim()
    .min(3, "Tell other customers a little about the job")
    .max(1000, "Comment must be 1000 characters or fewer"),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
