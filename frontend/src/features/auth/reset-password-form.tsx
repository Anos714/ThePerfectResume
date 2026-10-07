"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Check, Eye, EyeOff, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/features/auth/otp-input";
import { resetPasswordUser } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import {
  isValidEmail,
  isValidPassword,
  passwordRequirements,
} from "@/lib/validation";

export function ResetPasswordForm({
  userId,
  email,
}: {
  userId?: string;
  email?: string;
}) {
  const router = useRouter();

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  function setError(field: string, message: string | null) {
    setFormError(null);
    setFieldErrors((prev) => {
      if (!message) {
        if (!prev[field]) return prev;
        const next = { ...prev };
        delete next[field];
        return next;
      }
      return prev[field] === message ? prev : { ...prev, [field]: message };
    });
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};

    if (code.length !== 6) {
      nextErrors.code = "Enter the 6-digit code from your email";
    }
    if (!password) {
      nextErrors.password = "Password is required";
    } else if (!isValidPassword(password)) {
      nextErrors.password =
        "Use 8+ characters with upper and lowercase letters, a number and a special character";
    }
    if (!confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;
    setFormError(null);
    setIsPending(true);

    try {
      await resetPasswordUser({
        userId: userId as string,
        otp: code,
        newPassword: password,
        confirmPassword,
      });
      // No session is issued after a reset — the user signs in again.
      setIsComplete(true);
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message);
        setFieldErrors(error.fieldErrors);
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    } finally {
      setIsPending(false);
    }
  }

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col gap-6"
      >
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Password reset
          </h1>
          <p className="text-sm leading-relaxed text-muted">
            Your password has been updated. Sign in with your new password.
          </p>
        </div>
        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={() => router.push("/signin")}
        >
          Back to sign in
        </Button>
      </motion.div>
    );
  }

  // Reached without a pending reset (e.g. a cold load of /reset-password).
  if (!userId) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col gap-6"
      >
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Invalid reset link
          </h1>
          <p className="text-sm leading-relaxed text-muted">
            This link is missing the account to reset. Request a new code from
            the sign-in page.
          </p>
        </div>
        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={() => router.push("/forgot-password")}
        >
          Request a reset code
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-8"
    >
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Reset your password
        </h1>
        <p className="text-sm leading-relaxed text-muted">
          We sent a 6-digit code to{" "}
          <span className="font-medium text-foreground">
            {isValidEmail(email ?? "") ? email : "your email"}
          </span>
          . It expires in 10 minutes.
        </p>
      </div>

      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1.5">
          {fieldErrors.code ? (
            <span className="text-xs text-red-400">{fieldErrors.code}</span>
          ) : null}
          <OtpInput
            value={code}
            onChange={(value) => {
              setCode(value);
              setError("code", null);
            }}
            disabled={isPending}
            autoFocus
          />
        </div>

        <div className="relative flex flex-col gap-1.5">
          <Input
            name="password"
            type={showPassword ? "text" : "password"}
            label="New password"
            placeholder="Create a strong password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("password", null);
            }}
            error={fieldErrors.password}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="ring-focus absolute right-3.5 top-[34px] grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:text-white"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        <ul className="grid grid-cols-2 gap-2">
          {passwordRequirements.map((requirement) => {
            const passed = requirement.test(password);
            return (
              <li
                key={requirement.label}
                className="flex items-center gap-2 text-xs transition-colors"
                style={{ color: passed ? "#34d399" : undefined }}
              >
                <span
                  className={`grid h-4 w-4 shrink-0 place-items-center rounded-full ${passed ? "bg-emerald-400/20 text-emerald-300" : "bg-white/[0.06] text-muted"}`}
                >
                  <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
                </span>
                <span
                  className={passed ? "text-emerald-300" : "text-muted"}
                >
                  {requirement.label}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="relative flex flex-col gap-1.5">
          <Input
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            label="Confirm new password"
            placeholder="Re-enter your password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setError("confirmPassword", null);
            }}
            error={fieldErrors.confirmPassword}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="ring-focus absolute right-3.5 top-[34px] grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:text-white"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        {formError && (
          <p role="alert" className="text-sm text-red-400">
            {formError}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={isPending}>
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
          {isPending ? "Resetting…" : "Reset password"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted">
        Didn&apos;t receive a code?{" "}
        <Link
          href="/forgot-password"
          className="ring-focus font-medium text-brand-300 transition-colors hover:text-brand-200"
        >
          Resend it
        </Link>
      </p>
    </motion.div>
  );
}
