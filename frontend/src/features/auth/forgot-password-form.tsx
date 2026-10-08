"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { forgotPasswordUser } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { isValidEmail } from "@/lib/validation";

export function ForgotPasswordForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

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
    if (!email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!isValidEmail(email)) {
      nextErrors.email = "Enter a valid email address";
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
      const res = await forgotPasswordUser(email.trim());

      // The backend answers identically whether or not the address is
      // registered, so route from the email that was just typed rather than
      // any user id the response may or may not contain.
      if (res.success) {
        router.push(
          `/reset-password?email=${encodeURIComponent(email.trim())}`,
        );
        return;
      }

      setFormError(res.message);
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-8"
    >
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Forgot password
        </h1>
        <p className="text-sm leading-relaxed text-muted">
          Enter the email tied to your account and we&apos;ll send a one-time
          code to reset it.
        </p>
      </div>

      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <Input
          name="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("email", null);
          }}
          onBlur={() => {
            if (email.trim() && !isValidEmail(email)) {
              setError("email", "Enter a valid email address");
            }
          }}
          error={fieldErrors.email}
        />

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
          {isPending ? "Sending code…" : "Send reset code"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted">
        Remembered your password?{" "}
        <Link
          href="/signin"
          className="ring-focus font-medium text-brand-300 transition-colors hover:text-brand-200"
        >
          Back to sign in
        </Link>
      </p>
    </motion.div>
  );
}
