// Google sign-in uses the authorization-code flow: the browser sends the user
// to Google, Google redirects back with a `code`, and that code is exchanged on
// the backend (POST /users/auth/google) where the client secret lives.

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

export const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

// Defaults to `<origin>/auth/google/callback` so a deployment works without an
// explicit override. This must match the backend's GOOGLE_REDIRECT_URI.
export const googleRedirectUri =
  process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI ??
  (typeof window !== "undefined"
    ? `${window.location.origin}/auth/google/callback`
    : "");

export function getGoogleAuthUrl({
  clientId,
  redirectUri,
}: {
  clientId: string;
  redirectUri: string;
}): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    prompt: "consent",
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}
