import { z } from "zod";

export const registerUserSchema = z
  .object({
    username: z
      .string({ message: "Username is required" })
      .min(3, "Username must be at least 3 characters")
      .max(150, "Username cannot exceed 150 characters"),

    email: z
      .string({ message: "Email is required" })
      .email("Invalid email address")
      .max(150, "Email cannot exceed 150 characters"),

    password: z
      .string({ message: "Password is required" })
      .min(8, "Password must be at least 8 characters")
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/, {
        message:
          "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character",
      })
      .optional()
      .or(z.literal("")),

    confirmPassword: z
      .string({ message: "Confirm password is required" })
      .optional()
      .or(z.literal("")),

    avatarUrl: z.string().url("Invalid avatar URL").optional(),

    provider: z.enum(["local", "google"]).default("local"),
  })
  .superRefine((data, ctx) => {
    if (data.provider === "local") {
      if (!data.password || data.password.trim() === "") {
        ctx.addIssue({
          code: "custom",
          message: "Password is required for local registration",
          path: ["password"],
        });
        return;
      }

      if (!data.confirmPassword || data.confirmPassword.trim() === "") {
        ctx.addIssue({
          code: "custom",
          message: "Confirm password is required for local registration",
          path: ["confirmPassword"],
        });
        return;
      }

      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: "custom",
          message: "Passwords do not match",
          path: ["confirmPassword"],
        });
        return;
      }
    }
  });

export const loginUserSchema = z.object({
  email: z.string({ message: "Email is required" }).email("Invalid email"),
  password: z.string({ message: "Password is required" }),
});

export const verifyUserSchema = z.object({
  userId: z.string({ message: "User ID is required" }),
  otp: z.string({ message: "OTP is required" }),
});

// types
export type RegisterInput = z.infer<typeof registerUserSchema>;
export type LoginInput = z.infer<typeof loginUserSchema>;
export type VerifyUserInput = z.infer<typeof verifyUserSchema>;
