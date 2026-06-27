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
