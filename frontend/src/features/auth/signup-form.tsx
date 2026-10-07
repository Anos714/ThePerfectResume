"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Check, Eye, EyeOff, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GoogleAuthSection } from "@/features/auth/google-auth-section";
import { useAuth } from "@/features/auth/auth-provider";
import { ApiError } from "@/lib/api";
import {
  USERNAME_MIN_LENGTH,
  isValidEmail,
  isValidPassword,
  passwordRequirements,
} from "@/lib/validation";

export function SignUpForm() {
  const router = useRouter();
  const { register } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

    if (!username.trim()) {
      nextErrors.username = "Username is required";
    } else if (username.trim().length < USERNAME_MIN_LENGTH) {
      nextErrors.username = `Username must be at least ${USERNAME_MIN_LENGTH} characters`;
    }

    if (!email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!isValidEmail(email)) {
      nextErrors.email = "Enter a valid email address";
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
      const res = await register({
        username,
        email,
        password,
        confirmPassword,
      });

      // The backend answers 201 with the new (unverified) user and emails a
      // one-time code; the session is only issued after verification.
      if (!res.user) {
        setFormError(res.message);
        return;
      }

      router.push(
        `/verify?userId=${res.user.id}&email=${encodeURIComponent(res.user.email)}`,
      );
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
          Create your account
        </h1>
        <p className="text-sm leading-relaxed text-muted">
          Free forever — no credit card required.
        </p>
      </div>

      <GoogleAuthSection />

      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <Input
          name="username"
          label="Username"
          placeholder="alexandracarter"
          autoComplete="username"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setError("username", null);
          }}
          error={fieldErrors.username}
        />
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
        <div className="relative flex flex-col gap-1.5">
          <Input
            name="password"
            type={showPassword ? "text" : "password"}
            label="Password"
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
                <span className={passed ? "text-emerald-300" : "text-muted"}>
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
            label="Confirm password"
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
          {isPending ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link
          href="/signin"
          className="ring-focus font-medium text-brand-300 transition-colors hover:text-brand-200"
        >
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}
