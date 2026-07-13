"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";
import { saveSiteSettings, type SiteSettings } from "@/lib/settings";
import { saveOverrides, getOverrides, type FlatMessages } from "@/lib/translations";

/**
 * Save site SEO translations (one per locale) + non-translatable site settings.
 */
export async function saveSiteGeneralAction(
  seoByLocale: Record<string, FlatMessages>,
  settings: SiteSettings,
): Promise<{ ok: boolean }> {
  await requireAdmin();

  // Write SEO fields into the translation overrides for each locale
  for (const [locale, seoValues] of Object.entries(seoByLocale)) {
    const existing = await getOverrides(locale);
    const merged = { ...existing };
    for (const [key, value] of Object.entries(seoValues)) {
      if (value) {
        merged[key] = value;
      } else {
        delete merged[key];
      }
    }
    await saveOverrides(locale, merged);
  }

  // Write non-translatable settings
  await saveSiteSettings(settings);

  revalidatePath("/", "layout");
  return { ok: true };
}

