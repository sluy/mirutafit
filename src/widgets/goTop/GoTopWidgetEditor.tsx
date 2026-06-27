"use client";

import { useTranslations } from "next-intl";
import { inputClass } from "@/components/ui/Field";
import type { GoTopConfig, GoTopCorner, WidgetEditorProps } from "../types";

const CORNERS: GoTopCorner[] = ["top-left", "top-right", "bottom-left", "bottom-right"];

export default function GoTopWidgetEditor({ config, onChange }: WidgetEditorProps<GoTopConfig>) {
  const t = useTranslations("admin.widgets.goTop");
  const set = (patch: Partial<GoTopConfig>) => onChange({ ...config, ...patch });

  return (
    <div className="space-y-6">
      {/* Corner */}
      <div>
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/40">{t("corner")}</span>
        <div className="grid w-28 grid-cols-2 gap-1.5">
          {CORNERS.map((c) => {
            const items = c.includes("bottom") ? "items-end" : "items-start";
            const justify = c.includes("right") ? "justify-end" : "justify-start";
            return (
              <button
                key={c}
                type="button"
                onClick={() => set({ corner: c })}
                title={t(`corner_${c}`)}
                className={`flex h-10 rounded-lg border-2 p-1.5 transition-colors ${items} ${justify} ${config.corner === c ? "border-brand bg-brand/10" : "border-ink/10 hover:border-brand/40"}`}
              >
                <span className="h-2 w-2 rounded-full bg-brand" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Colors */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink/40">{t("bg")}</span>
          <div className="flex items-center gap-2">
            <input type="color" value={config.bg || "#16c47f"} onChange={(e) => set({ bg: e.target.value })} className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent p-0" />
            <input value={config.bg} onChange={(e) => set({ bg: e.target.value })} className={`${inputClass()} max-w-[140px]`} />
          </div>
        </div>
        <div>
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink/40">{t("iconColor")}</span>
          <div className="flex items-center gap-2">
            <input type="color" value={config.iconColor || "#ffffff"} onChange={(e) => set({ iconColor: e.target.value })} className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent p-0" />
            <input value={config.iconColor} onChange={(e) => set({ iconColor: e.target.value })} className={`${inputClass()} max-w-[140px]`} />
          </div>
        </div>
      </div>

      {/* Offset + showAfter */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink/40">{t("offset")}</span>
          <input type="number" min={0} max={120} value={config.offset} onChange={(e) => set({ offset: Math.max(0, Number(e.target.value) || 0) })} className={inputClass()} />
        </div>
        <div>
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink/40">{t("showAfter")}</span>
          <input type="number" min={0} max={2000} step={50} value={config.showAfter} onChange={(e) => set({ showAfter: Math.max(0, Number(e.target.value) || 0) })} className={inputClass()} />
          <p className="mt-1 text-xs text-ink/40">{t("showAfterHint")}</p>
        </div>
      </div>

      {/* Round */}
      <label className="flex items-center gap-2 text-sm text-ink/80">
        <input type="checkbox" checked={config.round} onChange={(e) => set({ round: e.target.checked })} className="h-4 w-4 rounded border-ink/20 text-brand focus:ring-brand" />
        {t("round")}
      </label>
    </div>
  );
}
