import { notFound } from "next/navigation";
import { getSurveyForEdit } from "@/lib/surveys";
import SurveyEditor from "@/components/admin/surveys/SurveyEditor";

export default async function EditSurveyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const survey = await getSurveyForEdit(id);
  if (!survey) notFound();
  return <SurveyEditor survey={survey} />;
}
