"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";
import {
  createArticle,
  saveArticle,
  deleteArticle,
  type ArticleEditData,
} from "@/lib/articles";

export async function createArticleAction(): Promise<{ id: string }> {
  await requireAdmin();
  const id = await createArticle();
  revalidatePath("/admin/content/articles");
  return { id };
}

export async function saveArticleAction(
  input: ArticleEditData,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const res = await saveArticle(input);
  if (res.ok) {
    revalidatePath("/admin/content/articles");
    revalidatePath("/articles");
  }
  return res;
}

export async function deleteArticleAction(id: string): Promise<{ ok: boolean }> {
  await requireAdmin();
  await deleteArticle(id);
  revalidatePath("/admin/content/articles");
  return { ok: true };
}
