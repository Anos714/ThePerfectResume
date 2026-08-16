import { z } from "zod";

export const registerUserSchema = z
  .object({
    username: z
      .string({ error: "Username is required" })
      .min(3, "Username must be at least 3 characters")
      .max(150, "Username cannot exceed 150 characters"),

    email: z
      .string({ error: "Email is required" })
      .email("Invalid email address")
      .max(150, "Email cannot exceed 150 characters"),

    password: z
      .string({ error: "Password is required" })
      .min(8, "Password must be at least 8 characters")
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/, {
        error:
          "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character",
      })
      .optional()
      .or(z.literal("")),

    confirmPassword: z
      .string({ error: "Confirm password is required" })
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
  email: z.string({ error: "Email is required" }).email("Invalid email"),
  password: z.string({ error: "Password is required" }),
});

export const verifyUserSchema = z.object({
  userId: z.string({ error: "User ID is required" }),
  otp: z.string({ error: "OTP is required" }),
});

export const forgotPasswordSchema = z.object({
  email: z.string({ error: "Email is required" }).email("Invalid email"),
});

export const resetPasswordSchema = z
  .object({
    userId: z.string({ error: "User ID is required" }),
    otp: z.string({ error: "OTP is required" }),
    newPassword: z
      .string({ error: "Password is required" })
      .min(8, "Password must be at least 8 characters")
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/, {
        error:
          "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character",
      }),
    confirmPassword: z.string({ error: "Confirm password is required" }),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

export const changePasswordSchema = z
  .object({
    oldPassword: z.string({ error: "Old password is required" }),
    newPassword: z
      .string({ error: "Password is required" })
      .min(8, "Password must be at least 8 characters")
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/, {
        error:
          "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character",
      }),
    confirmPassword: z.string({ error: "Confirm password is required" }),
  })
  .superRefine((data, ctx) => {
    if (data.oldPassword === data.newPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Old password cannot be the same as new password",
        path: ["newPassword"],
      });
    }

    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

// types
export type RegisterInput = z.infer<typeof registerUserSchema>;
export type LoginInput = z.infer<typeof loginUserSchema>;
export type VerifyUserInput = z.infer<typeof verifyUserSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
