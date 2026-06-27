"use client";

import { useTranslations } from "next-intl";
import { inputClass } from "@/components/ui/Field";
import { useLocalized } from "../LocaleContext";
import type { CommunityConfig, WidgetEditorProps } from "../types";

export default function CommunityWidgetEditor({
  config,
  onChange,
}: WidgetEditorProps<CommunityConfig>) {
  const t = useTranslations("admin.widgets.community");
  const lt = useLocalized();
  const set = (patch: Partial<CommunityConfig>) => onChange({ ...config, ...patch });

  return (
    <div className="space-y-6">
      <Labeled label={t("eyebrow")}>
        <input value={lt.g(config.eyebrow)} onChange={(e) => set({ eyebrow: lt.s(config.eyebrow, e.target.value) })} className={inputClass()} />
      </Labeled>
      <Labeled label={t("heading")}>
        <input value={lt.g(config.heading)} onChange={(e) => set({ heading: lt.s(config.heading, e.target.value) })} className={inputClass()} />
      </Labeled>
      <Labeled label={t("subtitle")}>
        <textarea value={lt.g(config.subtitle)} onChange={(e) => set({ subtitle: lt.s(config.subtitle, e.target.value) })} rows={2} className={`${inputClass()} resize-none`} />
      </Labeled>

      <div className="grid gap-4 sm:grid-cols-2">
        <Labeled label={t("count")}>
          <input
            type="number"
            min={1}
            max={30}
            value={config.count}
            onChange={(e) => set({ count: Math.max(1, Number(e.target.value) || 1) })}
            className={inputClass()}
          />
        </Labeled>
        <Labeled label={t("emptyText")}>
          <input value={lt.g(config.emptyText)} onChange={(e) => set({ emptyText: lt.s(config.emptyText, e.target.value) })} className={inputClass()} />
        </Labeled>
      </div>

      <label className="flex items-center gap-2 text-sm text-ink/80">
        <input
          type="checkbox"
          checked={config.showForm}
          onChange={(e) => set({ showForm: e.target.checked })}
          className="h-4 w-4 rounded border-ink/20 text-brand focus:ring-brand"
        />
        {t("showForm")}
      </label>

      {config.showForm && (
        <div className="grid gap-4 rounded-xl border border-ink/10 bg-gray-50 p-4 sm:grid-cols-2">
          <Labeled label={t("formTitle")}>
            <input value={lt.g(config.formTitle)} onChange={(e) => set({ formTitle: lt.s(config.formTitle, e.target.value) })} className={inputClass()} />
          </Labeled>
          <Labeled label={t("formSubtitle")}>
            <input value={lt.g(config.formSubtitle)} onChange={(e) => set({ formSubtitle: lt.s(config.formSubtitle, e.target.value) })} className={inputClass()} />
          </Labeled>
        </div>
      )}
    </div>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink/40">{label}</span>
      {children}
    </div>
  );
}
