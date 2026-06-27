import { getTranslations } from "next-intl/server";
import { getContactSettings } from "@/lib/settings";
import ContactSettingsForm from "@/components/admin/contact/ContactSettingsForm";

export default async function ContactSettingsPage() {
  const t = await getTranslations("admin.contact");
  const settings = await getContactSettings();

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl font-extrabold text-ink">{t("settingsTitle")}</h1>
        <p className="mt-1 text-ink/60">{t("settingsDesc")}</p>
      </header>
      <ContactSettingsForm initial={settings} />
    </div>
  );
}
