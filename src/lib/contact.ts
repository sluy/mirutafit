import { prisma } from "./prisma";
import { getContactSettings, getSmtpSettings } from "./settings";
import { sendMail } from "./mailer";

export type ContactMode = "person" | "brand";

export type ContactInput = {
  mode: ContactMode;
  name: string;
  email: string;
  phone?: string;
  topic?: string;
  subject: string;
  message: string;
};

export type ContactMessageItem = {
  id: string;
  mode: ContactMode;
  name: string;
  email: string;
  phone: string | null;
  topic: string | null;
  subject: string;
  message: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(v: string | undefined, max: number): string {
  return (v ?? "").trim().slice(0, max);
}

/**
 * Persist a contact message and (best-effort) email a notification to the
 * configured recipient. A failed notification never fails the submission — the
 * message is already saved and visible in the admin inbox.
 */
export async function submitContactMessage(
  input: ContactInput,
): Promise<{ ok: boolean; error?: "validation" }> {
  const name = clean(input.name, 120);
  const email = clean(input.email, 160);
  const subject = clean(input.subject, 200);
  const message = clean(input.message, 5000);
  const mode: ContactMode = input.mode === "brand" ? "brand" : "person";

  if (!name || !subject || !message || !EMAIL_RE.test(email)) {
    return { ok: false, error: "validation" };
  }

  await prisma.contactMessage.create({
    data: {
      mode,
      name,
      email,
      phone: clean(input.phone, 60) || null,
      topic: clean(input.topic, 160) || null,
      subject,
      message,
    },
  });

  // Notify (best-effort).
  try {
    const settings = await getContactSettings();
    if (settings.notify && settings.recipientEmail) {
      const smtp = await getSmtpSettings();
      const lines = [
        `New ${mode === "brand" ? "brand/sponsor" : "visitor"} message from ${name} <${email}>`,
        input.phone ? `Phone: ${clean(input.phone, 60)}` : "",
        input.topic ? `Topic: ${clean(input.topic, 160)}` : "",
        `Subject: ${subject}`,
        "",
        message,
      ].filter(Boolean);
      await sendMail(smtp, settings.recipientEmail, `[MiRutaFit] ${subject}`, lines.join("\n"), {
        from: { name: settings.fromName, email: settings.fromEmail },
        replyTo: email,
      });
    }
  } catch {
    // Swallow — the message is saved; delivery is non-critical.
  }

  return { ok: true };
}

function toItem(m: {
  id: string;
  mode: string;
  name: string;
  email: string;
  phone: string | null;
  topic: string | null;
  subject: string;
  message: string;
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
}): ContactMessageItem {
  return {
    id: m.id,
    mode: m.mode === "brand" ? "brand" : "person",
    name: m.name,
    email: m.email,
    phone: m.phone,
    topic: m.topic,
    subject: m.subject,
    message: m.message,
    isRead: m.isRead,
    readAt: m.readAt?.toISOString() ?? null,
    createdAt: m.createdAt.toISOString(),
  };
}

export type ContactInboxFilter = "all" | "unread" | "read";

export async function listContactMessages(
  filter: ContactInboxFilter = "all",
): Promise<ContactMessageItem[]> {
  const where =
    filter === "unread" ? { isRead: false } : filter === "read" ? { isRead: true } : {};
  const rows = await prisma.contactMessage.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return rows.map(toItem);
}

export async function getUnreadContactCount(): Promise<number> {
  return prisma.contactMessage.count({ where: { isRead: false } });
}

export async function setContactMessageRead(id: string, read: boolean): Promise<void> {
  await prisma.contactMessage.update({
    where: { id },
    data: { isRead: read, readAt: read ? new Date() : null },
  });
}

export async function markAllContactRead(): Promise<void> {
  await prisma.contactMessage.updateMany({
    where: { isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
}

export async function deleteContactMessage(id: string): Promise<void> {
  await prisma.contactMessage.delete({ where: { id } });
}
