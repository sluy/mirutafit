"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { inputClass } from "@/components/ui/Field";
import { useLocalized } from "../LocaleContext";
import type {
  ContactConfig,
  ContactModeContent,
  ContactWidgetMode,
  WidgetEditorProps,
} from "../types";

const CHECKER: React.CSSProperties = {
  backgroundImage: "repeating-conic-gradient(#e5e7eb 0% 25%, #ffffff 0% 50%)",
  backgroundSize: "20px 20px",
};

export default function ContactWidgetEditor({
  config,
  onChange,
}: WidgetEditorProps<ContactConfig>) {
  const t = useTranslations("admin.widgets.contact");
  const lt = useLocalized();
  const [tab, setTab] = useState<ContactWidgetMode>("person");

  const set = (patch: Partial<ContactConfig>) => onChange({ ...config, ...patch });
  const setMode = (mode: ContactWidgetMode, patch: Partial<ContactModeContent>) =>
    onChange({ ...config, [mode]: { ...config[mode], ...patch } });

  const mc = config[tab];

  return (
    <div className="space-y-6">
      {/* Header texts */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Labeled label={t("eyebrow")}>
          <input value={lt.g(config.eyebrow)} onChange={(e) => set({ eyebrow: lt.s(config.eyebrow, e.target.value) })} className={inputClass()} />
        </Labeled>
        <Labeled label={t("heading")}>
          <input value={lt.g(config.heading)} onChange={(e) => set({ heading: lt.s(config.heading, e.target.value) })} className={inputClass()} />
        </Labeled>
      </div>
      <Labeled label={t("subtitle")}>
        <textarea value={lt.g(config.subtitle)} onChange={(e) => set({ subtitle: lt.s(config.subtitle, e.target.value) })} rows={2} className={`${inputClass()} resize-none`} />
      </Labeled>

      {/* Background */}
      <Labeled label={t("bg")}>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => set({ bg: "transparent" })}
            title={t("transparent")}
            className={`h-8 w-8 rounded-lg border-2 ${config.bg === "transparent" ? "border-brand ring-2 ring-brand/30" : "border-ink/10"}`}
            style={CHECKER}
          />
          <input type="color" value={config.bg === "transparent" ? "#f9fafb" : config.bg} onChange={(e) => set({ bg: e.target.value })} className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent p-0" />
          <input value={config.bg} onChange={(e) => set({ bg: e.target.value })} className={`${inputClass()} max-w-[140px]`} />
        </div>
      </Labeled>

      {/* Behaviour */}
      <div className="space-y-3 rounded-xl border border-ink/10 bg-gray-50 p-4">
        <label className="flex items-center gap-2 text-sm text-ink/80">
          <input type="checkbox" checked={config.allowModeToggle} onChange={(e) => set({ allowModeToggle: e.target.checked })} className="h-4 w-4 rounded border-ink/20 text-brand focus:ring-brand" />
          {t("allowModeToggle")}
        </label>
        <Labeled label={t("defaultMode")}>
          <select value={config.defaultMode} onChange={(e) => set({ defaultMode: e.target.value as ContactWidgetMode })} className={inputClass()}>
            <option value="person">{lt.g(config.person.toggleLabel) || "Persona"}</option>
            <option value="brand">{lt.g(config.brand.toggleLabel) || "Marca"}</option>
          </select>
        </Labeled>
        <label className="flex items-center gap-2 text-sm text-ink/80">
          <input type="checkbox" checked={config.showContactInfo} onChange={(e) => set({ showContactInfo: e.target.checked })} className="h-4 w-4 rounded border-ink/20 text-brand focus:ring-brand" />
          {t("showContactInfo")}
        </label>
        {config.showContactInfo && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Labeled label={t("contactEmail")}>
              <input value={config.contactEmail} onChange={(e) => set({ contactEmail: e.target.value })} className={inputClass()} />
            </Labeled>
            <Labeled label={t("contactPhone")}>
              <input value={config.contactPhone} onChange={(e) => set({ contactPhone: e.target.value })} className={inputClass()} />
            </Labeled>
          </div>
        )}
      </div>

      {/* Per-mode content */}
      <div>
        <div className="mb-3 flex gap-1 border-b border-ink/10">
          {(["person", "brand"] as ContactWidgetMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setTab(m)}
              className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                tab === m ? "border-brand text-brand" : "border-transparent text-ink/50 hover:text-ink"
              }`}
            >
              {m === "person" ? t("modePerson") : t("modeBrand")}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Labeled label={t("toggleLabel")}>
              <input value={lt.g(mc.toggleLabel)} onChange={(e) => setMode(tab, { toggleLabel: lt.s(mc.toggleLabel, e.target.value) })} className={inputClass()} />
            </Labeled>
            <Labeled label={t("badge")}>
              <input value={lt.g(mc.badge)} onChange={(e) => setMode(tab, { badge: lt.s(mc.badge, e.target.value) })} className={inputClass()} />
            </Labeled>
          </div>
          <Labeled label={t("bannerTitle")}>
            <input value={lt.g(mc.bannerTitle)} onChange={(e) => setMode(tab, { bannerTitle: lt.s(mc.bannerTitle, e.target.value) })} className={inputClass()} />
          </Labeled>
          <Labeled label={t("bannerText")}>
            <textarea value={lt.g(mc.bannerText)} onChange={(e) => setMode(tab, { bannerText: lt.s(mc.bannerText, e.target.value) })} rows={3} className={`${inputClass()} resize-none`} />
          </Labeled>
          <Labeled label={t("points")} hint={t("onePerLine")}>
            <textarea
              value={lt.gl(mc.points).join("\n")}
              onChange={(e) => setMode(tab, { points: lt.sl(mc.points, splitLines(e.target.value)) })}
              rows={3}
              className={`${inputClass()} resize-none`}
            />
          </Labeled>
          <Labeled label={t("topics")} hint={t("onePerLine")}>
            <textarea
              value={lt.gl(mc.topics).join("\n")}
              onChange={(e) => setMode(tab, { topics: lt.sl(mc.topics, splitLines(e.target.value)) })}
              rows={4}
              className={`${inputClass()} resize-none`}
            />
          </Labeled>
          <Labeled label={t("placeholder")}>
            <input value={lt.g(mc.placeholder)} onChange={(e) => setMode(tab, { placeholder: lt.s(mc.placeholder, e.target.value) })} className={inputClass()} />
          </Labeled>
        </div>
      </div>
    </div>
  );
}

function splitLines(value: string): string[] {
  return value
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function Labeled({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink/40">{label}</span>
      {children}
      {hint && <p className="mt-1 text-xs text-ink/40">{hint}</p>}
    </div>
  );
}
