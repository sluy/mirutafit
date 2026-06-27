import { getTranslations } from "next-intl/server";
import { getRegistrationEnabled, getOauthSettings } from "@/lib/settings";
import RegistrationToggle from "@/components/admin/RegistrationToggle";
import GoogleLoginSettings from "@/components/admin/GoogleLoginSettings";

export default async function AdminUsersSettingsPage() {
  const t = await getTranslations("admin.usersSettings");
  const [enabled, oauth] = await Promise.all([getRegistrationEnabled(), getOauthSettings()]);

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl font-extrabold text-ink">{t("title")}</h1>
        <p className="mt-1 text-ink/60">{t("subtitle")}</p>
      </header>

      <div className="max-w-2xl space-y-6">
        <div className="rounded-2xl border border-ink/5 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-6">
            <div>
              <p className="font-display font-bold text-ink">{t("registrationTitle")}</p>
              <p className="mt-1 text-sm text-ink/50">{t("registrationDesc")}</p>
            </div>
            <RegistrationToggle initial={enabled} />
          </div>
        </div>

        <div className="rounded-2xl border border-ink/5 bg-white p-6 shadow-sm">
          <GoogleLoginSettings
            initial={{
              googleEnabled: oauth.googleEnabled,
              googleClientId: oauth.googleClientId,
              hasSecret: Boolean(oauth.googleClientSecret),
            }}
          />
        </div>
      </div>
    </div>
  );
}
