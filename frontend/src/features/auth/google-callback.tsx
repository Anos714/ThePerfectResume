"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { useAuth } from "@/features/auth/auth-provider";

// Google redirects here with the authorization code in the query string. It is
// exchanged for a session on the backend, which is where the client secret
// lives; nothing sensitive ever reaches the browser.
export function GoogleCallback({ code, error }: { code?: string; error?: string }) {
  const router = useRouter();
  const { loginWithGoogleCode } = useAuth();
  const [failure, setFailure] = useState<string | null>(null);
  const started = useRef(false);

  // The pending + error states are derived from the props so the effect never
  // has to setState synchronously.
  const message = failure
    ? failure
    : error
      ? `Google did not authorise the sign in: ${error}`
      : !code
        ? "No authorisation code came back from Google."
        : "Finishing your sign in…";

  useEffect(() => {
    // Nothing to exchange until there is a code; the message covers those cases.
    if (error || !code) return;

    // Strict mode / remounts must not exchange the same code twice.
    if (started.current) return;
    started.current = true;

    loginWithGoogleCode(code)
      .then(() => {
        router.push("/dashboard");
        router.refresh();
      })
      .catch((err: unknown) => {
        setFailure(
          err instanceof Error ? err.message : "Google sign in failed.",
        );
      });
  }, [code, error, loginWithGoogleCode, router]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-6">
      <Logo href="/" />
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted" aria-hidden />
        <p className="max-w-sm text-sm leading-relaxed text-muted">{message}</p>
        <Button variant="secondary" size="lg" className="w-full max-w-xs">
          <Link href="/signin" className="ring-focus rounded-full">
            Back to sign in
          </Link>
        </Button>
      </div>
    </div>
  );
}
