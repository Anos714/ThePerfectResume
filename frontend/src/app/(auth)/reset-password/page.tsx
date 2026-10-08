import { ResetPasswordForm } from "@/features/auth/reset-password-form";

// Arrived at from the forgot-password screen. The address the code was sent to
// travels in the query string; the account is resolved from it server-side, so
// no internal user id is ever exposed to the browser.
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return <ResetPasswordForm email={email} />;
}
