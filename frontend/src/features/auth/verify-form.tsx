"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/features/auth/otp-input";
import { useAuth } from "@/features/auth/auth-provider";
import { ApiError } from "@/lib/api";

export function VerifyForm({
  userId,
  email,
}: {
  userId?: string;
  email?: string;
}) {
  const router = useRouter();
  const { verifyOtp } = useAuth();

  const [code, setCode] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (code.length !== 6) {
      setFormError("Enter the 6-digit code from your email.");
      return;
    }

    setIsPending(true);

    try {
      // A session is issued here, so there's no second login step.
      await verifyOtp(userId as string, code);
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsPending(false);
    }
  }

  // Reached without a pending registration (e.g. a cold load of /verify).
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
            Invalid verification link
          </h1>
          <p className="text-sm leading-relaxed text-muted">
            This link is missing the account to verify. Sign in or create an
            account to receive a code.
          </p>
        </div>
        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={() => router.push("/signin")}
        >
          Go to sign in
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
          Verify your email
        </h1>
        <p className="text-sm leading-relaxed text-muted">
          We sent a 6-digit code to{" "}
          <span className="font-medium text-foreground">
            {email ?? "your email"}
          </span>
          . It expires in 10 minutes.
        </p>
      </div>

      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <OtpInput
          value={code}
          onChange={(value) => {
            setCode(value);
            setFormError(null);
          }}
          disabled={isPending}
          autoFocus
        />

        {formError && (
          <p role="alert" className="-mt-2 text-sm text-red-400">
            {formError}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={isPending}>
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
          {isPending ? "Verifying…" : "Verify email"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted">
        Didn&apos;t receive a code?{" "}
        <Link
          href="/signin"
          className="ring-focus font-medium text-brand-300 transition-colors hover:text-brand-200"
        >
          Sign in again to resend it
        </Link>
      </p>
    </motion.div>
  );
}
