import { z } from "zod";

export const serviceSchema = z.object({
  category_id: z.string().min(1, "Choose a category"),
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(255, "Title must be 255 characters or fewer"),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be 2000 characters or fewer"),
  price: z
    .string()
    .trim()
    .refine(
      (value) =>
        /^\d+(\.\d{1,2})?$/.test(value) &&
        Number(value) > 0 &&
        Number(value) <= 999999.99,
      "Enter a price between 0.01 and 999999.99, with at most 2 decimals",
    ),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
