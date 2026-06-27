"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";
import {
  setCommentStatus,
  deleteComment,
  createSeedComment,
  type CommentStatus,
} from "@/lib/community";
import { getCommunitySettings, saveCommunitySettings } from "@/lib/settings";

const PAGE = "/admin/community/comments";

function revalidate() {
  revalidatePath(PAGE);
  revalidatePath("/", "layout"); // public wall may change
}

export async function setCommentStatusAction(
  id: string,
  status: CommentStatus,
): Promise<{ ok: boolean }> {
  await requireAdmin();
  await setCommentStatus(id, status);
  revalidate();
  return { ok: true };
}

export async function deleteCommentAction(id: string): Promise<{ ok: boolean }> {
  await requireAdmin();
  await deleteComment(id);
  revalidate();
  return { ok: true };
}

export async function createSeedCommentAction(input: {
  name: string;
  message: string;
}): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const res = await createSeedComment(input);
  if (res.ok) revalidate();
  return res;
}

export async function setAutoApproveAction(value: boolean): Promise<{ ok: boolean }> {
  await requireAdmin();
  const current = await getCommunitySettings();
  await saveCommunitySettings({ ...current, autoApprove: value });
  revalidatePath(PAGE);
  return { ok: true };
}
