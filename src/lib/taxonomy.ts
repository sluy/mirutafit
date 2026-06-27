import { prisma } from "./prisma";
import { locales } from "@/i18n/config";
import {
  slugifyKey,
  taxonomyLabel,
  type TaxonomyKind,
  type TaxonomyTerm,
} from "./taxonomy-shared";

// Re-export the client-safe bits so server callers can import from one place.
export {
  slugifyKey,
  taxonomyLabel,
  type TaxonomyKind,
  type TaxonomyTerm,
} from "./taxonomy-shared";

export async function listTaxonomies(kind: TaxonomyKind): Promise<TaxonomyTerm[]> {
  const rows = await prisma.taxonomy.findMany({
    where: { kind },
    orderBy: { key: "asc" },
    include: { translations: true },
  });
  return rows.map((r) => ({
    id: r.id,
    key: r.key,
    labels: Object.fromEntries(r.translations.map((t) => [t.locale, t.label])),
  }));
}

export async function createTaxonomy(
  kind: TaxonomyKind,
  rawKey: string,
  labels: Record<string, string>,
): Promise<{ ok: boolean; error?: "exists" | "empty" }> {
  const key = slugifyKey(rawKey);
  if (!key) return { ok: false, error: "empty" };

  const existing = await prisma.taxonomy.findUnique({
    where: { kind_key: { kind, key } },
  });
  if (existing) return { ok: false, error: "exists" };

  await prisma.taxonomy.create({
    data: {
      kind,
      key,
      translations: {
        create: locales
          .filter((l) => labels[l]?.trim())
          .map((l) => ({ locale: l, label: labels[l].trim() })),
      },
    },
  });
  return { ok: true };
}

export async function updateTaxonomyLabels(
  id: string,
  labels: Record<string, string>,
): Promise<void> {
  for (const locale of locales) {
    const label = labels[locale]?.trim();
    if (label) {
      await prisma.taxonomyTranslation.upsert({
        where: { taxonomyId_locale: { taxonomyId: id, locale } },
        create: { taxonomyId: id, locale, label },
        update: { label },
      });
    } else {
      await prisma.taxonomyTranslation.deleteMany({ where: { taxonomyId: id, locale } });
    }
  }
  await prisma.taxonomy.update({ where: { id }, data: { updatedAt: new Date() } });
}

export async function deleteTaxonomy(id: string): Promise<void> {
  await prisma.taxonomy.delete({ where: { id } });
}

export type MenuCategory = { key: string; label: string; href: string };

/**
 * Resolve an ordered set of category keys into navbar menu entries (localized
 * label + `/articles?category=<key>` href). Unknown keys are skipped; order is
 * preserved. Empty input → empty list (navbar falls back to its default links).
 */
export async function getMenuCategories(
  locale: string,
  keys: string[],
): Promise<MenuCategory[]> {
  if (!keys || keys.length === 0) return [];
  const rows = await prisma.taxonomy.findMany({
    where: { kind: "category", key: { in: keys } },
    include: { translations: true },
  });
  const byKey = new Map(
    rows.map((r) => [
      r.key,
      { id: r.id, key: r.key, labels: Object.fromEntries(r.translations.map((t) => [t.locale, t.label])) },
    ]),
  );
  const out: MenuCategory[] = [];
  for (const key of keys) {
    const term = byKey.get(key);
    if (!term) continue;
    out.push({ key, label: taxonomyLabel(term, locale), href: `/articles?category=${key}` });
  }
  return out;
}
