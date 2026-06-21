"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";
import { getSmtpSettings, saveSmtpSettings, type SmtpSettings } from "@/lib/settings";
import { sendMail } from "@/lib/mailer";

export type SmtpFormInput = Omit<SmtpSettings, "port"> & { port: number | string };

export async function saveSmtpAction(input: SmtpFormInput): Promise<{ ok: boolean }> {
  await requireAdmin();

  // An empty password field means "keep the current password".
  const current = await getSmtpSettings();
  const password = input.password.trim() ? input.password : current.password;

  await saveSmtpSettings({
    host: input.host.trim(),
    port: Number(input.port) || 587,
    secure: Boolean(input.secure),
    username: input.username.trim(),
    password,
    fromName: input.fromName.trim(),
    fromEmail: input.fromEmail.trim(),
  });

  revalidatePath("/admin/system/email");
  return { ok: true };
}

export type TestEmailInput = { to: string; subject: string; body: string };
export type TestEmailResult = { ok: true } | { ok: false; error: string };

export async function sendTestEmailAction(
  input: TestEmailInput,
): Promise<TestEmailResult> {
  await requireAdmin();
  const smtp = await getSmtpSettings();
  return sendMail(smtp, input.to, input.subject, input.body);
}

