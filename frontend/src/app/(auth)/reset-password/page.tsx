import { ResetPasswordForm } from "@/features/auth/reset-password-form";

// Arrived at from the forgot-password screen. The user id the reset call needs
// travels in the query string.
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string; email?: string }>;
}) {
  const { userId, email } = await searchParams;

  return <ResetPasswordForm userId={userId} email={email} />;
}
