"use client";

import { useTranslations } from "next-intl";
import { inputClass } from "@/components/ui/Field";
import type { NavbarConfig, WidgetEditorProps } from "../types";

const PRESET_COLORS = [
  { label: "transparent", value: "transparent" },
  { label: "#000000", value: "#000000" },
  { label: "#1a1a2e", value: "#1a1a2e" },
  { label: "#16213e", value: "#16213e" },
  { label: "#0f3460", value: "#0f3460" },
  { label: "#533483", value: "#533483" },
];

export default function NavbarWidgetEditor({
  config,
  onChange,
}: WidgetEditorProps<NavbarConfig>) {
  const t = useTranslations("admin.widgets.navbar");

  const set = (patch: Partial<NavbarConfig>) => onChange({ ...config, ...patch });

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

      {/* Background at scroll 0 */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink/40">
            {t("topBg")}
          </span>
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => set({ topBg: c.value })}
                  title={c.label}
                  className={`h-8 w-8 rounded-lg border-2 transition-transform hover:scale-110 ${
                    config.topBg === c.value ? "border-brand ring-2 ring-brand/30" : "border-ink/10"
                  } ${c.value === "transparent" ? "bg-[repeating-conic-gradient(#e5e5e5_0%_25%,white_0%_50%)] bg-[size:8px_8px]" : ""}`}
                  style={c.value !== "transparent" ? { backgroundColor: c.value } : undefined}
                />
              ))}
            </div>
            <input
              type="color"
              value={config.topBg === "transparent" ? "#000000" : config.topBg}
              onChange={(e) => set({ topBg: e.target.value })}
              className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent p-0"
              title={t("customColor")}
            />
            <input
              value={config.topBg}
              onChange={(e) => set({ topBg: e.target.value })}
              className={`${inputClass()} max-w-[140px]`}
            />
          </div>
        </div>

        <div>
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink/40">
            {t("topText")}
          </span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={config.topText}
              onChange={(e) => set({ topText: e.target.value })}
              className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent p-0"
            />
            <input
              value={config.topText}
              onChange={(e) => set({ topText: e.target.value })}
              className={`${inputClass()} max-w-[140px]`}
            />
          </div>
        </div>
      </div>

      {/* Toggles */}
      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm text-ink/80">
          <input
            type="checkbox"
            checked={config.showBrand}
            onChange={(e) => set({ showBrand: e.target.checked })}
            className="h-4 w-4 rounded border-ink/20 text-brand focus:ring-brand"
          />
          {t("showBrand")}
        </label>
        <label className="flex items-center gap-2 text-sm text-ink/80">
          <input
            type="checkbox"
            checked={config.showSocialBar}
            onChange={(e) => set({ showSocialBar: e.target.checked })}
            className="h-4 w-4 rounded border-ink/20 text-brand focus:ring-brand"
          />
          {t("showSocialBar")}
        </label>
      </div>

      {/* Social bar appearance */}
      {config.showSocialBar && (
        <div className="space-y-4 rounded-xl border border-ink/10 bg-gray-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">{t("socialBar")}</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <span className="mb-1 block text-xs font-medium text-ink/50">{t("socialBg")}</span>
              <div className="flex items-center gap-2">
                <input type="color" value={config.socialBg} onChange={(e) => set({ socialBg: e.target.value })} className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent p-0" />
                <input value={config.socialBg} onChange={(e) => set({ socialBg: e.target.value })} className={`${inputClass()} max-w-[120px]`} />
              </div>
            </div>
            <div>
              <span className="mb-1 block text-xs font-medium text-ink/50">{t("socialText")}</span>
              <div className="flex items-center gap-2">
                <input type="color" value={config.socialText} onChange={(e) => set({ socialText: e.target.value })} className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent p-0" />
                <input value={config.socialText} onChange={(e) => set({ socialText: e.target.value })} className={`${inputClass()} max-w-[120px]`} />
              </div>
            </div>
            <div>
              <span className="mb-1 block text-xs font-medium text-ink/50">{t("socialAlign")}</span>
              <div className="flex gap-1">
                {(["left", "center", "right"] as const).map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => set({ socialAlign: a })}
                    className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${
                      config.socialAlign === a ? "border-brand bg-brand/10 text-brand" : "border-ink/10 text-ink/60 hover:border-brand/40"
                    }`}
                  >
                    {t(`align.${a}`)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {/* Live preview of the social bar */}
          <div className="overflow-hidden rounded-lg" style={{ backgroundColor: config.socialBg, color: config.socialText }}>
            <div className={`flex items-center gap-3 px-3 py-2 ${config.socialAlign === "left" ? "justify-start" : config.socialAlign === "center" ? "justify-center" : "justify-end"}`}>
              <span className="h-4 w-4 rounded-full bg-current opacity-70" />
              <span className="h-4 w-4 rounded-full bg-current opacity-70" />
              <span className="h-4 w-4 rounded-full bg-current opacity-70" />
            </div>
          </div>
        </div>
      )}

      {/* Preview swatch */}
      <div className="overflow-hidden rounded-xl border border-ink/10">
        <div
          className="flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors"
          style={{
            backgroundColor: config.topBg === "transparent" ? "rgba(0,0,0,0)" : config.topBg,
            color: config.topText,
          }}
        >
          <span className="font-display font-bold">
            {config.showBrand ? "MiRutaFit" : "—"}
          </span>
          <span className="text-xs opacity-60">{t("preview")}</span>
        </div>
        <div className="bg-gray-100 px-4 py-8 text-center text-xs text-ink/30">
          {t("previewHint")}
        </div>
      </div>
    </div>
  );
}
