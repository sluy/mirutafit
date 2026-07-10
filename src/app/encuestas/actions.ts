"use server";

import { revalidatePath } from "next/cache";
import { submitSurveyResponse } from "@/lib/surveys";

export async function submitSurveyAction(
  slug: string,
  answers: { questionId: string; value: string }[],
): Promise<{ ok: boolean; error?: string }> {
  const res = await submitSurveyResponse(slug, answers);
  if (res.ok) revalidatePath("/admin/surveys");
  return res;
}
