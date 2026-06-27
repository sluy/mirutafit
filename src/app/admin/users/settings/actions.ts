"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";
import {
  setRegistrationEnabled,
  getOauthSettings,
  saveOauthSettings,
} from "@/lib/settings";

export async function setRegistrationAction(enabled: boolean): Promise<{ ok: boolean }> {
  await requireAdmin();
  await setRegistrationEnabled(enabled);
  revalidatePath("/admin/users/settings");
  return { ok: true };
}

export type GoogleOauthInput = {
  googleEnabled: boolean;
  googleClientId: string;
  googleClientSecret: string; // empty → keep current
};

export async function saveGoogleOauthAction(
  input: GoogleOauthInput,
): Promise<{ ok: boolean }> {
  await requireAdmin();
  const current = await getOauthSettings();
  // An empty secret field means "keep the stored secret".
  const googleClientSecret = input.googleClientSecret.trim()
    ? input.googleClientSecret.trim()
    : current.googleClientSecret;
  await saveOauthSettings({
    googleEnabled: Boolean(input.googleEnabled),
    googleClientId: input.googleClientId.trim(),
    googleClientSecret,
  });
  revalidatePath("/admin/users/settings");
  return { ok: true };
}
