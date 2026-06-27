"use server";

import { revalidatePath } from "next/cache";
import { submitContactMessage, type ContactInput } from "@/lib/contact";

/** Public form payload (includes a honeypot field bots tend to fill). */
export type ContactSubmitInput = ContactInput & { website?: string };

export async function submitContactMessageAction(
  input: ContactSubmitInput,
): Promise<{ ok: boolean; error?: string }> {
  // Honeypot: a real user never fills the hidden "website" field. Pretend it
  // succeeded so bots get no signal, but drop the message.
  if (input.website && input.website.trim()) return { ok: true };

  const res = await submitContactMessage({
    mode: input.mode,
    name: input.name,
    email: input.email,
    phone: input.phone,
    topic: input.topic,
    subject: input.subject,
    message: input.message,
  });

  if (res.ok) revalidatePath("/admin/contact/messages");
  return res;
}
