import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";

/** Returns the current user (or null) from the request session. Server-side. */
export async function getSessionUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

/** `role` is a comma-separated list, so check membership. */
export function hasRole(
  user: { role?: string | null } | null,
  role: string,
): boolean {
  if (!user?.role) return false;
  return user.role
    .split(",")
    .map((r) => r.trim())
    .includes(role);
}

export function isAdmin(user: { role?: string | null } | null): boolean {
  return hasRole(user, "admin");
}

/** Gate for any signed-in (non-banned) user. Redirects to /login otherwise. */
export async function requireUser() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.banned) redirect("/login");
  return user;
}

/**
 * Gate for admin pages: redirects unless the user is a signed-in, non-banned
 * admin. Returns the user so callers can use it.
 */
export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.banned) redirect("/login");
  if (!isAdmin(user)) redirect("/");
  return user;
}
