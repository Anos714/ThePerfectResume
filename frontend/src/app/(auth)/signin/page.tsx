import { SignInForm } from "@/features/auth/signin-form";

// searchParams is a Promise in Next.js 16. Reading it here (server side) keeps
// the client form free of a Suspense boundary.
export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string | string[] }>;
}) {
  const { redirect } = await searchParams;
  const redirectTo = Array.isArray(redirect) ? redirect[0] : redirect;

  return <SignInForm redirect={redirectTo} />;
}
