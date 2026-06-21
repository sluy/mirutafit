"use client";

import { useTranslations } from "next-intl";
import { inputClass } from "@/components/ui/Field";
import type { FooterConfig, WidgetEditorProps } from "../types";

export default function FooterWidgetEditor({
  config,
  onChange,
}: WidgetEditorProps<FooterConfig>) {
  const t = useTranslations("admin.widgets.footer");

  const set = (patch: Partial<FooterConfig>) => onChange({ ...config, ...patch });

  return (
    <div className="space-y-6">
      {/* Enabled */}
      <label className="flex items-center justify-between rounded-xl border border-ink/10 px-4 py-3">
        <span className="text-sm font-medium text-ink">{t("enabled")}</span>
        <input
          type="checkbox"
          checked={config.enabled}
          onChange={(e) => set({ enabled: e.target.checked })}
          className="h-5 w-5 rounded border-ink/20 text-brand focus:ring-brand"
        />
      </label>

      {/* Toggles */}
      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm text-ink/80">
          <input
            type="checkbox"
            checked={config.showSocial}
            onChange={(e) => set({ showSocial: e.target.checked })}
            className="h-4 w-4 rounded border-ink/20 text-brand focus:ring-brand"
          />
          {t("showSocial")}
        </label>
        <label className="flex items-center gap-2 text-sm text-ink/80">
          <input
            type="checkbox"
            checked={config.showNewsletter}
            onChange={(e) => set({ showNewsletter: e.target.checked })}
            className="h-4 w-4 rounded border-ink/20 text-brand focus:ring-brand"
          />
          {t("showNewsletter")}
        </label>
      </div>

      {/* Tagline */}
      <div>
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink/40">
          {t("tagline")}
        </span>
        <input
          value={config.tagline}
          onChange={(e) => set({ tagline: e.target.value })}
          placeholder={t("taglinePlaceholder")}
          className={inputClass()}
        />
        <p className="mt-1 text-xs text-ink/40">{t("taglineHint")}</p>
      </div>
    </div>
  );
}
