import nodemailer from "nodemailer";
import type { SmtpSettings } from "./settings";

/**
 * Send a single email using the SMTP settings stored in the database.
 *
 * Returns `{ ok: true }` on success, or `{ ok: false, error: string }` with
 * the real error message so the admin UI can display it.
 */
/** Optional overrides for a single send (e.g. contact notifications). */
export type SendMailOptions = {
  /** Override the From header (otherwise the SMTP `fromName`/`fromEmail`). */
  from?: { name?: string; email: string };
  /** Reply-To header (e.g. the visitor who submitted a contact form). */
  replyTo?: string;
};

export async function sendMail(
  smtp: SmtpSettings,
  to: string,
  subject: string,
  body: string,
  options?: SendMailOptions,
): Promise<{ ok: true } | { ok: false; error: string }> {
  // A valid From address must exist — either the override or the SMTP default.
  const fromEmail = options?.from?.email || smtp.fromEmail;
  if (!smtp.host || !fromEmail) {
    return { ok: false, error: "SMTP is not configured yet." };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth:
        smtp.username || smtp.password
          ? { user: smtp.username, pass: smtp.password }
          : undefined,
    });

    const fromName = options?.from?.name ?? smtp.fromName;

    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      replyTo: options?.replyTo,
      subject,
      text: body,
      html: `<div style="font-family:sans-serif;line-height:1.6">${body.replace(/\n/g, "<br>")}</div>`,
    });

    return { ok: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unknown error sending email.";
    return { ok: false, error: message };
  }
}
