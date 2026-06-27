import { getTranslations } from "next-intl/server";
import { getEditorData } from "@/lib/translations";
import { locales, localeNames } from "@/i18n/config";
import { getLocaleSettings } from "@/lib/settings";
import LanguageEditor from "@/components/admin/LanguageEditor";
import LocaleSettingsForm from "@/components/admin/LocaleSettingsForm";

export default async function AdminLanguagesPage() {
  const t = await getTranslations("admin.languages");
  const [editor, localeSettings] = await Promise.all([getEditorData(), getLocaleSettings()]);
  const available = locales.map((code) => ({ code, label: localeNames[code] ?? code }));

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl font-extrabold text-ink">{t("title")}</h1>
        <p className="mt-1 text-ink/60">{t("subtitle")}</p>
      </header>

      <LocaleSettingsForm initial={localeSettings} available={available} />

      <LanguageEditor editorData={editor} localeNames={localeNames} />
    </div>
  );
}
