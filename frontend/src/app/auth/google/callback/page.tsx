import { GoogleCallback } from "@/features/auth/google-callback";

// The OAuth redirect target. Lives outside the (auth) group on purpose: it is a
// transient loading state, not part of the branded two-panel shell.
export default async function GoogleCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; error?: string }>;
}) {
  const { code, error } = await searchParams;

  return <GoogleCallback code={code} error={error} />;
}
