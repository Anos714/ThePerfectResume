import { VerifyForm } from "@/features/auth/verify-form";

// Reached after signup or after signing in to an unverified account. The user
// id the OTP call needs travels in the query string.
export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string; email?: string }>;
}) {
  const { userId, email } = await searchParams;

  return <VerifyForm userId={userId} email={email} />;
}
