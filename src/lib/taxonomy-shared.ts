import { defaultLocale } from "@/i18n/config";

/**
 * Client-safe taxonomy helpers/types (no Prisma). The DB functions live in
 * `taxonomy.ts` (server only).
 */
export type TaxonomyKind = "category" | "tag";

export type TaxonomyTerm = {
  id: string;
  key: string;
  labels: Record<string, string>; // locale -> label
};

/** Turn a free-text label into a stable snake_case key. */
export function slugifyKey(input: string): string {
  const out = input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);
  return out || "item";
}

/** Best label for a term in a locale, with fallbacks. */
export function taxonomyLabel(term: TaxonomyTerm, locale: string): string {
  return term.labels[locale] || term.labels[defaultLocale] || term.key;
}
