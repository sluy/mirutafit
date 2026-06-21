"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Field, inputClass } from "@/components/ui/Field";
import MediaPicker from "@/components/ui/MediaPicker";
import { saveSiteGeneralAction } from "@/app/admin/site/general/actions";
import type { SiteSettings } from "@/lib/settings";
import type { FlatMessages } from "@/lib/translations";

/** The keys in en.json / es.json that hold the SEO fields. */
const SEO_KEYS = [
  "site.title",
  "site.description",
  "site.ogTitle",
  "site.ogDescription",
  "site.keywords",
] as const;

type SeoKey = (typeof SEO_KEYS)[number];

const LABELS: Record<SeoKey, string> = {
  "site.title": "pageTitle",
  "site.description": "metaDescription",
  "site.ogTitle": "ogTitle",
  "site.ogDescription": "ogDescription",
  "site.keywords": "keywords",
};

const HINTS: Record<SeoKey, string> = {
  "site.title": "pageTitleHint",
  "site.description": "metaDescriptionHint",
  "site.ogTitle": "ogTitleHint",
  "site.ogDescription": "ogDescriptionHint",
  "site.keywords": "keywordsHint",
};

export default function SiteGeneralForm({
  locales,
  localeNames,
  seoData,
  settings,
}: {
  locales: string[];
  localeNames: Record<string, string>;
  seoData: Record<string, FlatMessages>; // locale → { "site.title": "…", … }
  settings: SiteSettings;
}) {
  const t = useTranslations("admin.siteGeneral");
  const tc = useTranslations("common");
  const router = useRouter();

  // SEO values: one per locale per key
  const [seo, setSeo] = useState<Record<string, FlatMessages>>(() => {
    const init: Record<string, FlatMessages> = {};
    for (const locale of locales) {
      init[locale] = {};
      for (const key of SEO_KEYS) {
        init[locale][key] = seoData[locale]?.[key] ?? "";
      }
    }
    return init;
  });

  // Non-translatable
  const [canonicalUrl, setCanonicalUrl] = useState(settings.canonicalUrl);
  const [faviconUrl, setFaviconUrl] = useState(settings.faviconUrl);
  const [saving, setSaving] = useState(false);

  const updateSeo = (locale: string, key: string, value: string) => {
    setSeo((prev) => ({
      ...prev,
      [locale]: { ...prev[locale], [key]: value },
    }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const { ok } = await saveSiteGeneralAction(seo, {
        canonicalUrl,
        faviconUrl,
      });
      if (ok) {
        toast.success(t("saved"));
        router.refresh();
      } else {
        toast.error(t("error"));
      }
    } catch {
      toast.error(t("error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* SEO Fields */}
      <section className="overflow-hidden rounded-2xl border border-ink/5 bg-white shadow-sm">
        <div className="border-b border-ink/5 bg-gray-50/80 px-6 py-4">
          <h2 className="font-display text-lg font-bold text-ink">{t("seoSection")}</h2>
          <p className="mt-0.5 text-sm text-ink/50">{t("seoHint")}</p>
        </div>
        <div className="space-y-6 p-6">
          {SEO_KEYS.map((key) => (
            <div key={key}>
              <p className="mb-2 text-sm font-medium text-ink/80">{t(LABELS[key])}</p>
              <p className="mb-3 text-xs text-ink/40">{t(HINTS[key])}</p>
              <div className="space-y-2">
                {locales.map((locale) => (
                  <div key={locale} className="flex items-center gap-3">
                    <span className="w-10 shrink-0 rounded-lg bg-ink/5 py-1.5 text-center text-xs font-bold uppercase text-ink/50">
                      {locale}
                    </span>
                    {key === "site.description" || key === "site.ogDescription" ? (
                      <textarea
                        value={seo[locale]?.[key] ?? ""}
                        onChange={(e) => updateSeo(locale, key, e.target.value)}
                        rows={2}
                        className={`${inputClass()} resize-none`}
                        placeholder={`${localeNames[locale]}…`}
                      />
                    ) : (
                      <input
                        value={seo[locale]?.[key] ?? ""}
                        onChange={(e) => updateSeo(locale, key, e.target.value)}
                        className={inputClass()}
                        placeholder={`${localeNames[locale]}…`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Non-translatable settings */}
      <section className="overflow-hidden rounded-2xl border border-ink/5 bg-white shadow-sm">
        <div className="border-b border-ink/5 bg-gray-50/80 px-6 py-4">
          <h2 className="font-display text-lg font-bold text-ink">{t("advancedSection")}</h2>
        </div>
        <div className="space-y-4 p-6">
          <Field label={t("canonicalUrl")} htmlFor="canonical" hint={t("canonicalHint")}>
            <input
              id="canonical"
              value={canonicalUrl}
              onChange={(e) => setCanonicalUrl(e.target.value)}
              placeholder="https://mirutafit.com"
              className={inputClass()}
            />
          </Field>
          <MediaPicker
            value={faviconUrl}
            onChange={setFaviconUrl}
            accept="image/*"
            label={t("faviconUrl")}
          />
        </div>
      </section>

      {/* Save */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
        >
          {saving ? "…" : tc("save")}
        </button>
      </div>
    </div>
  );
}
