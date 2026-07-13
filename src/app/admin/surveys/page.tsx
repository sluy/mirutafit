import { getTranslations } from "next-intl/server";
import { listSurveys } from "@/lib/surveys";
import { getViewCounts } from "@/lib/views";
import SurveysList from "@/components/admin/surveys/SurveysList";

export default async function AdminSurveysPage() {
  const t = await getTranslations("admin.surveys");
  const surveys = await listSurveys();

  const counts = await getViewCounts(surveys.map((s) => `survey:${s.id}`));
  const views: Record<string, number> = {};
  for (const s of surveys) views[s.id] = counts[`survey:${s.id}`] ?? 0;

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl font-extrabold text-ink">{t("title")}</h1>
        <p className="mt-1 text-ink/60">{t("subtitle")}</p>
      </header>
      <SurveysList surveys={surveys} views={views} />
    </div>
  );
}
