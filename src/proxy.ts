import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Fast, optimistic auth gate that runs before rendering (Next 16 "proxy",
// formerly "middleware"). It only checks for the presence of a session cookie
// so the redirect is a clean 307. Full authorization (admin role, ban status)
// is still enforced server-side in the route layouts.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Optimistic auth gate for private areas (full checks run in the layouts).
  if (pathname.startsWith("/admin") || pathname.startsWith("/account")) {
    if (!getSessionCookie(request)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Expose the current path to server components (used by the maintenance gate
  // in the root layout — Next doesn't surface the pathname to RSC otherwise).
  const headers = new Headers(request.headers);
  headers.set("x-pathname", pathname);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  // Run on all pages (to set x-pathname) except static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
