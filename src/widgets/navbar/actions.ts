"use server";

import { cookies, headers } from "next/headers";
import { LOCALE_COOKIE, type Locale } from "@/i18n/config";
import { getEnabledLocales } from "@/lib/locale";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Switch the active language: persist the choice in the NEXT_LOCALE cookie and,
 * when signed in, update the account's saved language. Only enabled locales are
 * accepted.
 */
export async function setLocaleAction(locale: string): Promise<{ ok: boolean }> {
  const enabled = await getEnabledLocales();
  if (!enabled.includes(locale as Locale)) return { ok: false };

  (await cookies()).set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (session?.user) {
      await prisma.user.update({ where: { id: session.user.id }, data: { language: locale } });
    }
  } catch {
    // Not signed in (or session lookup failed) — the cookie alone is enough.
  }

  return { ok: true };
}
