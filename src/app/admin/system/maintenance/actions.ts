"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";
import { saveMaintenanceSettings, type MaintenanceSettings } from "@/lib/settings";

export async function saveMaintenanceAction(
  input: MaintenanceSettings,
): Promise<{ ok: boolean }> {
  await requireAdmin();
  await saveMaintenanceSettings({
    enabled: Boolean(input.enabled),
    title: input.title.trim(),
    message: input.message,
  });
  // Affects every public page.
  revalidatePath("/", "layout");
  return { ok: true };
}
