import { z } from "zod";

export const billingPeriodSchema = z.enum(["monthly", "yearly"]);

export const createCheckoutSchema = z
  .object({
    plan: z.enum(["pro", "career"], {
      error: "Plan must be one of: pro, career",
    }),
    period: billingPeriodSchema.default("monthly"),
    customer: z.object({
      email: z.string({ error: "Email is required" }).email("Invalid email"),
      name: z.string().trim().optional(),
    }),
    billing: z.object({
      country: z
        .string({ error: "Country is required" })
        .trim()
        .min(2, "Country is required")
        .max(2, "Use the two-letter ISO country code"),
      city: z.string().trim().optional(),
      state: z.string().trim().optional(),
      street: z.string().trim().optional(),
      zipcode: z.string().trim().optional(),
    }),
  })
  .strict();

export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>;
export type BillingPeriod = z.infer<typeof billingPeriodSchema>;
