import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getSurveyResponses } from "@/lib/surveys";
import { ArrowRightIcon } from "@/components/icons";
import SurveyResponsesView from "@/components/admin/surveys/SurveyResponsesView";

export default async function SurveyResponsesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("admin.surveys");
  const data = await getSurveyResponses(id);
  if (!data) notFound();

  return (
    <div>
      <div className="mb-6">
        <Link href={`/admin/surveys/${id}`} className="flex items-center gap-1.5 text-sm text-ink/50 hover:text-brand">
          <ArrowRightIcon width={15} height={15} className="rotate-180" />
          {t("backToSurvey")}
        </Link>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-ink">{data.survey.title}</h1>
        <p className="mt-1 text-ink/60">
          {t("responsesCount", { count: data.responses.length })}
        </p>
      </div>
      <SurveyResponsesView questions={data.questions} responses={data.responses} />
    </div>
  );
}
