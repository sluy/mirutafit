"use client";

import { useTranslations } from "next-intl";
import { inputClass } from "@/components/ui/Field";
import { useLocalized } from "../LocaleContext";
import type { MacroCalcConfig, MacroCalcSex, MacroCalcActivity, MacroCalcFloatingPosition, WidgetEditorProps } from "../types";

export default function MacroCalcWidgetEditor({
  config,
  onChange,
}: WidgetEditorProps<MacroCalcConfig>) {
  const t = useTranslations("admin.widgets.macroCalc");
  const lt = useLocalized();
  const set = (patch: Partial<MacroCalcConfig>) => onChange({ ...config, ...patch });

  return (
    <div className="space-y-6">
      {/* Header & Subtitle */}
      <Labeled label={t("eyebrow")}>
        <input
          value={lt.g(config.eyebrow)}
          onChange={(e) => set({ eyebrow: lt.s(config.eyebrow, e.target.value) })}
          className={inputClass()}
        />
      </Labeled>

      <Labeled label={t("heading")}>
        <input
          value={lt.g(config.heading)}
          onChange={(e) => set({ heading: lt.s(config.heading, e.target.value) })}
          className={inputClass()}
        />
      </Labeled>

      <Labeled label={t("subtitle")}>
        <textarea
          value={lt.g(config.subtitle)}
          onChange={(e) => set({ subtitle: lt.s(config.subtitle, e.target.value) })}
          rows={2}
          className={`${inputClass()} resize-none`}
        />
      </Labeled>

      {/* Colors & Appearance */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Labeled label={t("bg")}>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={config.bg || "#ffffff"}
              onChange={(e) => set({ bg: e.target.value })}
              className="h-9 w-10 cursor-pointer rounded border-0 bg-transparent p-0"
            />
            <input
              value={config.bg || "#ffffff"}
              onChange={(e) => set({ bg: e.target.value })}
              className={`${inputClass()} flex-1`}
            />
          </div>
        </Labeled>

        <Labeled label={t("accentColor")}>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={config.accentColor || "#16c47f"}
              onChange={(e) => set({ accentColor: e.target.value })}
              className="h-9 w-10 cursor-pointer rounded border-0 bg-transparent p-0"
            />
            <input
              value={config.accentColor || "#16c47f"}
              onChange={(e) => set({ accentColor: e.target.value })}
              className={`${inputClass()} flex-1`}
            />
          </div>
        </Labeled>
      </div>

      {/* Display Mode & Positioning */}
      <div className="rounded-xl border border-ink/10 bg-gray-50/70 p-4 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-ink/60">{t("displaySection")}</h4>

        <div className="grid gap-4 sm:grid-cols-2">
          <Labeled label={t("displayMode")}>
            <select
              value={config.displayMode || "panel"}
              onChange={(e) => set({ displayMode: e.target.value as "panel" | "floating" })}
              className={inputClass()}
            >
              <option value="panel">{t("modePanel")}</option>
              <option value="floating">{t("modeFloating")}</option>
            </select>
          </Labeled>

          {config.displayMode === "floating" ? (
            <Labeled label={t("floatingPosition")}>
              <select
                value={config.floatingPosition || "bottom-right"}
                onChange={(e) => set({ floatingPosition: e.target.value as MacroCalcFloatingPosition })}
                className={inputClass()}
              >
                <option value="bottom-right">{t("posBottomRight")}</option>
                <option value="bottom-left">{t("posBottomLeft")}</option>
                <option value="top-right">{t("posTopRight")}</option>
                <option value="top-left">{t("posTopLeft")}</option>
                <option value="top-center">{t("posTopCenter")}</option>
                <option value="bottom-center">{t("posBottomCenter")}</option>
              </select>
            </Labeled>
          ) : (
            <div>
              <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-ink/40">
                {t("panelSize")}
              </span>
              <label className="flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-ink/10 bg-white px-3 hover:bg-ink/5">
                <input
                  type="checkbox"
                  checked={config.fullHeight ?? false}
                  onChange={(e) => set({ fullHeight: e.target.checked })}
                  className="h-4 w-4 rounded border-ink/20 text-brand focus:ring-brand"
                />
                <span className="text-sm font-medium">{t("fullHeight")}</span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Default Form Inputs */}
      <div className="rounded-xl border border-ink/10 bg-gray-50/70 p-4 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-ink/60">{t("defaultsSection")}</h4>

        <div className="grid gap-4 sm:grid-cols-3">
          <Labeled label={t("defaultSex")}>
            <select
              value={config.defaultSex || "male"}
              onChange={(e) => set({ defaultSex: e.target.value as MacroCalcSex })}
              className={inputClass()}
            >
              <option value="male">{t("sexMale")}</option>
              <option value="female">{t("sexFemale")}</option>
            </select>
          </Labeled>

          <Labeled label={t("defaultAge")}>
            <input
              type="number"
              min={14}
              max={90}
              value={config.defaultAge ?? 28}
              onChange={(e) => set({ defaultAge: Number(e.target.value) })}
              className={inputClass()}
            />
          </Labeled>

          <Labeled label={t("defaultHeight")}>
            <input
              type="number"
              min={130}
              max={220}
              value={config.defaultHeight ?? 175}
              onChange={(e) => set({ defaultHeight: Number(e.target.value) })}
              className={inputClass()}
            />
          </Labeled>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Labeled label={t("defaultWeight")}>
            <input
              type="number"
              min={35}
              max={250}
              value={config.defaultWeight ?? 80}
              onChange={(e) => set({ defaultWeight: Number(e.target.value) })}
              className={inputClass()}
            />
          </Labeled>

          <Labeled label={t("defaultActivity")}>
            <select
              value={config.defaultActivity || "moderate"}
              onChange={(e) => set({ defaultActivity: e.target.value as MacroCalcActivity })}
              className={inputClass()}
            >
              <option value="sedentary">{t("actSedentary")}</option>
              <option value="light">{t("actLight")}</option>
              <option value="moderate">{t("actModerate")}</option>
              <option value="high">{t("actHigh")}</option>
              <option value="extreme">{t("actExtreme")}</option>
            </select>
          </Labeled>
        </div>
      </div>

      {/* Guide Link Customization */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={config.showGuideLink !== false}
            onChange={(e) => set({ showGuideLink: e.target.checked })}
            className="h-4 w-4 rounded border-ink/20 text-brand focus:ring-brand"
          />
          <span className="text-sm font-semibold text-ink">{t("showGuideLink")}</span>
        </label>

        {config.showGuideLink !== false && (
          <Labeled label={t("guideLinkText")}>
            <input
              value={lt.g(config.guideLinkText)}
              onChange={(e) => set({ guideLinkText: lt.s(config.guideLinkText, e.target.value) })}
              className={inputClass()}
            />
          </Labeled>
        )}
      </div>
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
