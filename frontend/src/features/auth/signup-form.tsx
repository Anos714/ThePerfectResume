"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Check, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/ui/google-icon";

const requirements = [
  { label: "8+ characters", test: (v: string) => v.length >= 8 },
  { label: "Uppercase & lowercase", test: (v: string) => /[a-z]/.test(v) && /[A-Z]/.test(v) },
  { label: "A number", test: (v: string) => /[0-9]/.test(v) },
  { label: "A special character", test: (v: string) => /[!@#$%^&*]/.test(v) },
];

export function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");

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
          name="username"
          label="Username"
          placeholder="alexandracarter"
          autoComplete="username"
        />
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
            placeholder="Create a strong password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          {requirements.map((req) => {
            const passed = req.test(password);
            return (
              <li
                key={req.label}
                className="flex items-center gap-2 text-xs transition-colors"
                style={{ color: passed ? "#34d399" : undefined }}
              >
                <span
                  className={`grid h-4 w-4 shrink-0 place-items-center rounded-full ${passed ? "bg-emerald-400/20 text-emerald-300" : "bg-white/[0.06] text-muted"}`}
                >
                  <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
                </span>
                <span className={passed ? "text-emerald-300" : "text-muted"}>
                  {req.label}
                </span>
              </li>
            );
          })}
        </ul>

        <Button type="submit" size="lg" className="w-full">
          Create account
          <ArrowRight className="h-4 w-4" />
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
