/**
 * Localizable widget content. A field is either a plain string (the same for
 * every language — e.g. legacy content authored before translations existed) or
 * a per-locale map. Renders resolve to the active locale; editors edit one
 * locale at a time (see `LocaleContext`).
 */
export type LocalizedText = string | Record<string, string>;
export type LocalizedList = string[] | Record<string, string[]>;

/** Render-side: best string for `locale`, falling back to any available value. */
export function resolveText(value: LocalizedText | undefined | null, locale: string): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  return value[locale] ?? Object.values(value).find((v) => v) ?? "";
}

/** Render-side: best list for `locale`, falling back to any available value. */
export function resolveList(value: LocalizedList | undefined | null, locale: string): string[] {
  if (value == null) return [];
  if (Array.isArray(value)) return value;
  return value[locale] ?? Object.values(value).find((v) => v && v.length) ?? [];
}

// ── Editing helpers ───────────────────────────────────────────
// A plain string is treated as the `defaultLocale`'s value (legacy content);
// other locales start empty until translated.

export function getText(value: LocalizedText | undefined, locale: string, defaultLocale: string): string {
  if (value == null) return "";
  if (typeof value === "string") return locale === defaultLocale ? value : "";
  return value[locale] ?? "";
}

export function setText(
  value: LocalizedText | undefined,
  locale: string,
  next: string,
  defaultLocale: string,
): LocalizedText {
  let obj: Record<string, string> = {};
  if (typeof value === "string") {
    if (value) obj[defaultLocale] = value;
  } else if (value) {
    obj = { ...value };
  }
  obj[locale] = next;
  return obj;
}

export function getList(value: LocalizedList | undefined, locale: string, defaultLocale: string): string[] {
  if (value == null) return [];
  if (Array.isArray(value)) return locale === defaultLocale ? value : [];
  return value[locale] ?? [];
}

export function setList(
  value: LocalizedList | undefined,
  locale: string,
  next: string[],
  defaultLocale: string,
): LocalizedList {
  let obj: Record<string, string[]> = {};
  if (Array.isArray(value)) {
    if (value.length) obj[defaultLocale] = value;
  } else if (value) {
    obj = { ...value };
  }
  obj[locale] = next;
  return obj;
}
