import { getTranslations } from "next-intl/server";
import { getEditorData } from "@/lib/translations";
import { localeNames } from "@/i18n/config";
import LanguageEditor from "@/components/admin/LanguageEditor";

export default async function AdminLanguagesPage() {
  const t = await getTranslations("admin.languages");
  const editor = await getEditorData();

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl font-extrabold text-ink">{t("title")}</h1>
        <p className="mt-1 text-ink/60">{t("subtitle")}</p>
      </header>

      <LanguageEditor
        editorData={editor}
        localeNames={localeNames}
      />
    </div>
  );
}
