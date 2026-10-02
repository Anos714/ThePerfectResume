"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/ui/google-icon";

export function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);

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

      <Button variant="secondary" className="h-11 w-full" type="button">
        <GoogleIcon className="h-4.5 w-4.5" />
        Continue with Google
      </Button>

      <div className="flex items-center gap-4">
        <span className="h-px flex-1 bg-white/[0.08]" />
        <span className="text-xs uppercase tracking-[0.16em] text-muted">
          or
        </span>
        <span className="h-px flex-1 bg-white/[0.08]" />
      </div>

      <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
        <Input
          name="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          autoComplete="email"
        />
        <div className="relative">
          <Input
            name="password"
            type={showPassword ? "text" : "password"}
            label="Password"
            placeholder="••••••••"
            autoComplete="current-password"
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

        <Button type="submit" size="lg" className="w-full">
          Sign in
          <ArrowRight className="h-4 w-4" />
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
