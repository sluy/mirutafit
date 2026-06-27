"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";
import {
  setContactMessageRead,
  markAllContactRead,
  deleteContactMessage,
} from "@/lib/contact";
import {
  saveContactSettings,
  type ContactSettings,
} from "@/lib/settings";

const INBOX = "/admin/contact/messages";

export async function markContactReadAction(
  id: string,
  read: boolean,
): Promise<{ ok: boolean }> {
  await requireAdmin();
  await setContactMessageRead(id, read);
  revalidatePath(INBOX);
  return { ok: true };
}

export async function markAllContactReadAction(): Promise<{ ok: boolean }> {
  await requireAdmin();
  await markAllContactRead();
  revalidatePath(INBOX);
  return { ok: true };
}

export async function deleteContactMessageAction(id: string): Promise<{ ok: boolean }> {
  await requireAdmin();
  await deleteContactMessage(id);
  revalidatePath(INBOX);
  return { ok: true };
}

export async function saveContactSettingsAction(
  input: ContactSettings,
): Promise<{ ok: boolean }> {
  await requireAdmin();
  await saveContactSettings({
    recipientEmail: input.recipientEmail.trim(),
    fromEmail: input.fromEmail.trim(),
    fromName: input.fromName.trim() || "MiRutaFit",
    notify: Boolean(input.notify),
  });
  revalidatePath("/admin/contact/settings");
  return { ok: true };
}
