import nodemailer from "nodemailer";
import type { SmtpSettings } from "./settings";

/**
 * Send a single email using the SMTP settings stored in the database.
 *
 * Returns `{ ok: true }` on success, or `{ ok: false, error: string }` with
 * the real error message so the admin UI can display it.
 */
export async function sendMail(
  smtp: SmtpSettings,
  to: string,
  subject: string,
  body: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!smtp.host || !smtp.fromEmail) {
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

    await transporter.sendMail({
      from: `"${smtp.fromName}" <${smtp.fromEmail}>`,
      to,
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
