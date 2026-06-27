"use server";

import { revalidatePath } from "next/cache";
import { submitComment } from "@/lib/community";

export type CommentSubmitInput = {
  name: string;
  message: string;
  website?: string; // honeypot
};

export async function submitCommentAction(
  input: CommentSubmitInput,
): Promise<{ ok: boolean; pending?: boolean; error?: string }> {
  // Honeypot — silently drop bot submissions.
  if (input.website && input.website.trim()) return { ok: true, pending: false };

  const res = await submitComment({ name: input.name, message: input.message });
  if (res.ok) {
    revalidatePath("/admin/community/comments");
    // Auto-approved comments should appear on public pages immediately.
    if (res.pending === false) revalidatePath("/", "layout");
  }
  return res;
}
