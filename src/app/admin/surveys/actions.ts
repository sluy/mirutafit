"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";
import {
  createSurvey,
  saveSurvey,
  deleteSurvey,
  deleteSurveyResponse,
  exportSurvey,
  importSurvey,
  type SurveyEditData,
  type SurveyExportData,
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

export async function exportSurveyAction(
  id: string,
): Promise<{ ok: boolean; data?: SurveyExportData; error?: string }> {
  await requireAdmin();
  const data = await exportSurvey(id);
  if (!data) return { ok: false, error: "not_found" };
  return { ok: true, data };
}

export async function importSurveyAction(
  data: SurveyExportData,
): Promise<{ ok: boolean; id?: string; error?: string }> {
  await requireAdmin();
  const res = await importSurvey(data);
  if (res.ok) revalidatePath("/admin/surveys");
  return res;
}

export async function deleteSurveyResponseAction(
  responseId: string,
): Promise<{ ok: boolean }> {
  await requireAdmin();
  await deleteSurveyResponse(responseId);
  return { ok: true };
}
