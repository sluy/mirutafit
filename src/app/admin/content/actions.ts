"use server";

import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";
import { requireAdmin } from "@/lib/auth-guard";
import {
  createTaxonomy,
  updateTaxonomyLabels,
  deleteTaxonomy,
  listTaxonomies,
  taxonomyLabel,
  type TaxonomyKind,
} from "@/lib/taxonomy";
import { listArticleOptions } from "@/lib/articles";

function pathFor(kind: TaxonomyKind) {
  return kind === "category" ? "/admin/content/categories" : "/admin/content/tags";
}

export async function createTaxonomyAction(
  kind: TaxonomyKind,
  key: string,
  labels: Record<string, string>,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const res = await createTaxonomy(kind, key, labels);
  if (res.ok) revalidatePath(pathFor(kind));
  return res;
}

export async function updateTaxonomyAction(
  kind: TaxonomyKind,
  id: string,
  labels: Record<string, string>,
): Promise<{ ok: boolean }> {
  await requireAdmin();
  await updateTaxonomyLabels(id, labels);
  revalidatePath(pathFor(kind));
  return { ok: true };
}

export async function deleteTaxonomyAction(
  kind: TaxonomyKind,
  id: string,
): Promise<{ ok: boolean }> {
  await requireAdmin();
  await deleteTaxonomy(id);
  revalidatePath(pathFor(kind));
  return { ok: true };
}

// ── Options for widget / navbar editors ───────────────────────────

export type Option = { key: string; label: string };

/** Article options (id + display title) for the manual picker. */
export async function listArticleOptionsAction(): Promise<
  { id: string; title: string; status: string }[]
> {
  await requireAdmin();
  const locale = await getLocale();
  return listArticleOptions(locale);
}

/** Taxonomy options (key + localized label) for category/tag pickers. */
export async function listTaxonomyOptionsAction(kind: TaxonomyKind): Promise<Option[]> {
  await requireAdmin();
  const locale = await getLocale();
  const terms = await listTaxonomies(kind);
  return terms.map((t) => ({ key: t.key, label: taxonomyLabel(t, locale) }));
}
