"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";
import { saveCodePolicy, type CodePolicy } from "@/lib/settings";

export async function saveCodePolicyAction(
  input: CodePolicy,
): Promise<{ ok: boolean }> {
  await requireAdmin();

  // At least one character type must be enabled.
  if (!input.useLetters && !input.useNumbers && !input.useSymbols) {
    return { ok: false };
  }

  await saveCodePolicy({
    length: Math.min(Math.max(Math.round(input.length) || 6, 4), 12),
    useLetters: Boolean(input.useLetters),
    useNumbers: Boolean(input.useNumbers),
    useSymbols: Boolean(input.useSymbols),
    expiryMinutes: Math.min(Math.max(Math.round(input.expiryMinutes) || 15, 1), 1440),
    maxAttempts: Math.min(Math.max(Math.round(input.maxAttempts) || 5, 1), 20),
  });

  revalidatePath("/admin/system/codes");
  return { ok: true };
}
