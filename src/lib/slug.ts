/**
 * Lenient slug sanitizer for a live text input: lowercases and swaps invalid
 * chars for dashes, but KEEPS a trailing "-" and allows the empty string, so the
 * user can type "foo-bar" and clear the field. The strict `slugify` (which trims
 * dashes and falls back to "post") runs server-side on save.
 */
export function liveSlugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .slice(0, 80);
}

/** URL slug (dashes), client-safe. e.g. "Mi Receta!" -> "mi-receta". */
export function slugify(input: string): string {
  const out = input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return out || "post";
}
