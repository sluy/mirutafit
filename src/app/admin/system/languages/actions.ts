"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";
import { applyEditorValues, addBaseKey, type FlatMessages } from "@/lib/translations";
import { saveLocaleSettings, type LocaleSettings } from "@/lib/settings";

export async function saveLocaleSettingsAction(
  input: LocaleSettings,
): Promise<{ ok: boolean }> {
  await requireAdmin();
  // Keep at least one enabled locale; fall back to the chosen single/default.
  const enabled = input.enabled.length ? input.enabled : [input.fallback || input.single];
  await saveLocaleSettings({
    mode: input.mode === "single" ? "single" : "multi",
    single: input.single,
    enabled,
    fallback: enabled.includes(input.fallback) ? input.fallback : enabled[0],
  });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function saveTranslationsAction(
  values: Record<string, FlatMessages>,
): Promise<{ ok: boolean }> {
  await requireAdmin();
  await applyEditorValues(values);
  // Translations affect every page.
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function addKeyAction(
  key: string,
  enValue: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  if (!key.trim()) return { ok: false, error: "Key is required." };
  try {
    await addBaseKey(key.trim(), enValue);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
