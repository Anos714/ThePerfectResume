"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GoogleAuthSection } from "@/features/auth/google-auth-section";
import { useAuth } from "@/features/auth/auth-provider";
import { ApiError } from "@/lib/api";
import { safeRedirect } from "@/lib/redirect";

export function SignInForm({ redirect }: { redirect?: string }) {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setFormError(null);
    setIsPending(true);

    try {
      const res = await login(email, password, remember);

      if (!res.success || !res.token) {
        // A 200 with success:false means the account is unverified and a fresh
        // OTP was just emailed. Route to the verify screen with the id it needs.
        if (res.user) {
          router.push(
            `/verify?userId=${res.user.id}&email=${encodeURIComponent(res.user.email)}`,
          );
          return;
        }
        setFormError(res.message);
        return;
      }

      router.push(safeRedirect(redirect) ?? "/dashboard");
      router.refresh();
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
          Sign in
        </h1>
        <p className="text-sm leading-relaxed text-muted">
          Welcome back. Pick up right where you left off.
        </p>
      </div>

      <GoogleAuthSection />

      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <Input
          name="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
        />
        <div className="relative flex flex-col gap-1.5">
          <Input
            name="password"
            type={showPassword ? "text" : "password"}
            label="Password"
            placeholder="••••••••"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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

        <div className="flex items-center justify-between text-sm">
          <label className="ring-focus flex cursor-pointer items-center gap-2 text-muted">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-white/[0.04] accent-brand-500"
            />
            Remember me
          </label>
          <Link
            href="#"
            className="ring-focus text-brand-300 transition-colors hover:text-brand-200"
          >
            Forgot password?
          </Link>
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
          {isPending ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="ring-focus font-medium text-brand-300 transition-colors hover:text-brand-200"
        >
          Sign up free
        </Link>
      </p>
    </motion.div>
  );
}
