"use client";

import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/ui/google-icon";
import { getGoogleAuthUrl, googleClientId, googleRedirectUri } from "@/lib/google";

// The Google button and its "or" divider render only when a client id is
// configured, so a checkout without OAuth credentials doesn't show a dead
// button.
export function GoogleAuthSection() {
  if (!googleClientId) return null;

  const handleClick = () => {
    window.location.assign(
      getGoogleAuthUrl({
        clientId: googleClientId,
        redirectUri: googleRedirectUri,
      }),
    );
  };

  return (
    <>
      <Button
        variant="secondary"
        className="h-11 w-full"
        type="button"
        onClick={handleClick}
      >
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
    </>
  );
}
