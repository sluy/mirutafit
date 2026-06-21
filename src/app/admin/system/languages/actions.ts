"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";
import { applyEditorValues, addBaseKey, type FlatMessages } from "@/lib/translations";

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
