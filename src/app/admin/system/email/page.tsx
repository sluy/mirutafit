import { getTranslations } from "next-intl/server";
import { getSmtpSettings } from "@/lib/settings";
import SmtpForm from "@/components/admin/SmtpForm";

export default async function AdminEmailSettingsPage() {
  const t = await getTranslations("admin.settings");
  const smtp = await getSmtpSettings();

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl font-extrabold text-ink">{t("smtpTitle")}</h1>
        <p className="mt-1 text-ink/60">{t("smtpDesc")}</p>
      </header>

      <SmtpForm
        initial={{
          host: smtp.host,
          port: smtp.port,
          secure: smtp.secure,
          username: smtp.username,
          fromName: smtp.fromName,
          fromEmail: smtp.fromEmail,
          hasPassword: Boolean(smtp.password),
        }}
      />
    </div>
  );
}
