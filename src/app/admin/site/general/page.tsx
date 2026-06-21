import { getTranslations } from "next-intl/server";
import { locales, localeNames } from "@/i18n/config";
import { getSiteSettings } from "@/lib/settings";
import { flatten, getOverrides } from "@/lib/translations";
import type { FlatMessages } from "@/lib/translations";
import SiteGeneralForm from "@/components/admin/SiteGeneralForm";

const SEO_KEYS = [
  "site.title",
  "site.description",
  "site.ogTitle",
  "site.ogDescription",
  "site.keywords",
];

export default async function SiteGeneralPage() {
  const t = await getTranslations("admin.siteGeneral");
  const settings = await getSiteSettings();

  // Load current SEO values from base messages + DB overrides
  const seoData: Record<string, FlatMessages> = {};
  for (const locale of locales) {
    const base = flatten((await import(`@/messages/${locale}.json`)).default);
    const overrides = await getOverrides(locale);
    const merged = { ...base, ...overrides };
    const seo: FlatMessages = {};
    for (const key of SEO_KEYS) {
      seo[key] = merged[key] ?? "";
    }
    seoData[locale] = seo;
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl font-extrabold text-ink">{t("title")}</h1>
        <p className="mt-1 text-ink/60">{t("subtitle")}</p>
      </header>

      <SiteGeneralForm
        locales={[...locales]}
        localeNames={localeNames}
        seoData={seoData}
        settings={settings}
      />
    </div>
  );
}
