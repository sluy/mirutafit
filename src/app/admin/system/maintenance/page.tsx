import { getTranslations } from "next-intl/server";
import { getMaintenanceSettings } from "@/lib/settings";
import MaintenanceForm from "@/components/admin/MaintenanceForm";

export default async function AdminMaintenancePage() {
  const t = await getTranslations("admin.maintenance");
  const settings = await getMaintenanceSettings();

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl font-extrabold text-ink">{t("title")}</h1>
        <p className="mt-1 text-ink/60">{t("subtitle")}</p>
      </header>
      <MaintenanceForm initial={settings} />
    </div>
  );
}
