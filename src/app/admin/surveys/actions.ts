"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";
import {
  createSurvey,
  saveSurvey,
  deleteSurvey,
  type SurveyEditData,
} from "@/lib/surveys";

export async function createSurveyAction(): Promise<{ id: string }> {
  await requireAdmin();
  const id = await createSurvey();
  revalidatePath("/admin/surveys");
  return { id };
}

export async function saveSurveyAction(
  input: SurveyEditData,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const res = await saveSurvey(input);
  if (res.ok) {
    revalidatePath("/admin/surveys");
    revalidatePath(`/encuestas/${input.slug}`);
  }
  return res;
}

export async function deleteSurveyAction(id: string): Promise<{ ok: boolean }> {
  await requireAdmin();
  await deleteSurvey(id);
  revalidatePath("/admin/surveys");
  return { ok: true };
}
