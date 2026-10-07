import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Route protection for the dashboard. This is an *optimistic* check: the
// httpOnly refresh cookie is present whenever the backend considers the session
// alive, so we can redirect unauthenticated users before the page renders.
// The secure authorisation check still happens on the backend per request.
//
// Note: Next.js 16 renamed `middleware.ts` to `proxy.ts`; this file uses the
// current convention.

const REFRESH_COOKIE = "refreshToken";
const SIGNIN_PATH = "/signin";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isDashboardRoute = pathname.startsWith("/dashboard");
  if (!isDashboardRoute) {
    return NextResponse.next();
  }

  const hasSession = request.cookies.has(REFRESH_COOKIE);
  if (!hasSession) {
    const signInUrl = new URL(SIGNIN_PATH, request.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run on dashboard routes only; skip static assets, images, and API routes.
  matcher: ["/dashboard/:path*"],
};
