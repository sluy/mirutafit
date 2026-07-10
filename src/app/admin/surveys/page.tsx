import { getTranslations } from "next-intl/server";
import { listSurveys } from "@/lib/surveys";
import SurveysList from "@/components/admin/surveys/SurveysList";

export default async function AdminSurveysPage() {
  const t = await getTranslations("admin.surveys");
  const surveys = await listSurveys();

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl font-extrabold text-ink">{t("title")}</h1>
        <p className="mt-1 text-ink/60">{t("subtitle")}</p>
      </header>
      <SurveysList surveys={surveys} />
    </div>
  );
}
