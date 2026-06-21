"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";
import { setRegistrationEnabled } from "@/lib/settings";

export async function setRegistrationAction(enabled: boolean): Promise<{ ok: boolean }> {
  await requireAdmin();
  await setRegistrationEnabled(enabled);
  revalidatePath("/admin/users/settings");
  return { ok: true };
}
