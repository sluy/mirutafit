import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Fast, optimistic auth gate that runs before rendering (Next 16 "proxy",
// formerly "middleware"). It only checks for the presence of a session cookie
// so the redirect is a clean 307. Full authorization (admin role, ban status)
// is still enforced server-side in the route layouts.
export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/account", "/account/:path*"],
};
