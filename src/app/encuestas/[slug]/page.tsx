import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicSurvey } from "@/lib/surveys";
import SurveyForm from "@/components/surveys/SurveyForm";
import ViewCounter from "@/components/ViewCounter";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const survey = await getPublicSurvey(slug);
  if (!survey) return {};
  return {
    title: survey.title,
    description: survey.description || undefined,
    robots: { index: false }, // surveys are private forms, not for search engines
  };
}

export default async function SurveyPage({ params }: { params: Params }) {
  const { slug } = await params;
  const survey = await getPublicSurvey(slug);
  if (!survey) notFound();
  return (
    <>
      <ViewCounter viewKey={`survey:${survey.id}`} />
      <SurveyForm survey={survey} />
    </>
  );
}
