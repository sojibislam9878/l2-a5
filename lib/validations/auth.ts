import { z } from "zod";

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(255, "Name must be 255 characters or fewer"),
    email: z.email("Enter a valid email address").trim().toLowerCase(),
    phone_no: z
      .string()
      .trim()
      .min(7, "Enter a valid phone number")
      .max(20, "Phone number must be 20 characters or fewer")
      .regex(/^[+\d][\d\s-]*$/, "Only digits, spaces and dashes are allowed"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(64, "Password must be 64 characters or fewer")
      .regex(/[a-zA-Z]/, "Include at least one letter")
      .regex(/\d/, "Include at least one number"),
    confirmPassword: z.string(),
    role: z.enum(["customer", "technician"], "Select an account type"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
