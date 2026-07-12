"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";
import {
  createStaticPage,
  saveStaticPage,
  deleteStaticPage,
  type StaticPageEditData,
} from "@/lib/static-pages";

export async function createStaticPageAction(): Promise<{ id: string }> {
  await requireAdmin();
  const id = await createStaticPage();
  revalidatePath("/admin/static-pages");
  return { id };
}

export async function saveStaticPageAction(
  input: StaticPageEditData,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const res = await saveStaticPage(input);
  if (res.ok) {
    revalidatePath("/admin/static-pages");
    revalidatePath(`/static/${input.slug}`);
  }
  return res;
}

export async function deleteStaticPageAction(id: string): Promise<{ ok: boolean }> {
  await requireAdmin();
  await deleteStaticPage(id);
  revalidatePath("/admin/static-pages");
  return { ok: true };
}
