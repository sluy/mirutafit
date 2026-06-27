import { cookies, headers } from "next/headers";
import {
  locales,
  defaultLocale,
  isLocale,
  localeNames,
  LOCALE_COOKIE,
  type Locale,
} from "@/i18n/config";
import { getLocaleSettings } from "./settings";

/** All locales the app ships messages for. */
export function availableLocales(): readonly Locale[] {
  return locales;
}

/** Locales the public site currently offers (validated against available). */
export async function getEnabledLocales(): Promise<Locale[]> {
  const s = await getLocaleSettings();
  if (s.mode === "single") return [isLocale(s.single) ? s.single : defaultLocale];
  const enabled = s.enabled.filter(isLocale);
  return enabled.length ? enabled : [defaultLocale];
}

/** Enabled locales as `{ code, label }` for UI (language switcher, admin). */
export async function getLocaleOptions(): Promise<{ code: Locale; label: string }[]> {
  return (await getEnabledLocales()).map((code) => ({ code, label: localeNames[code] ?? code }));
}

/**
 * Resolve the active locale for the current request. Priority (multi mode):
 * NEXT_LOCALE cookie (manual switch) → the account's saved language → the
 * browser's Accept-Language → the configured fallback. Single mode forces one.
 */
export async function detectRequestLocale(userLanguage?: string | null): Promise<Locale> {
  const s = await getLocaleSettings();
  if (s.mode === "single") return isLocale(s.single) ? s.single : defaultLocale;

  const enabled = s.enabled.filter(isLocale);
  if (enabled.length === 0) return defaultLocale;
  const fallback = isLocale(s.fallback) && enabled.includes(s.fallback) ? s.fallback : enabled[0];

  const cookieLocale = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(cookieLocale) && enabled.includes(cookieLocale)) return cookieLocale;

  if (userLanguage && isLocale(userLanguage) && enabled.includes(userLanguage)) return userLanguage;

  const accept = ((await headers()).get("accept-language") ?? "").toLowerCase();
  for (const l of enabled) {
    if (accept.includes(l)) return l;
  }
  return fallback;
}
