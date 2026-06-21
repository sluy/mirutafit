// Single source of truth for the supported languages.
// Base language is English; Spanish is the only translation for now.
export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** Human-readable display names for each supported locale. */
export const localeNames: Record<string, string> = {
  en: "English",
  es: "Español",
};

// Cookie used to remember a manual language choice (set later from the UI).
export const LOCALE_COOKIE = "NEXT_LOCALE";

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

