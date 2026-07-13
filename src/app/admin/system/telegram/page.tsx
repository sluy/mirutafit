import { getTranslations } from "next-intl/server";
import { getTelegramSettings } from "@/lib/settings";
import TelegramSettingsForm from "@/components/admin/TelegramSettingsForm";

export default async function TelegramPage() {
  const t = await getTranslations("admin.telegram");
  const telegram = await getTelegramSettings();

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl font-extrabold text-ink">{t("title")}</h1>
        <p className="mt-1 text-ink/60">{t("subtitle")}</p>
      </header>

      <TelegramSettingsForm settings={telegram} />
    </div>
  );
}
