"use client";

import { useTranslations } from "next-intl";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { inputClass } from "@/components/ui/Field";
import { useLocalized } from "../LocaleContext";
import type {
  RichTextConfig,
  RichTextHeightMode,
  WidgetEditorProps,
} from "../types";

const MODES: RichTextHeightMode[] = ["auto", "fixed", "full"];

export default function RichTextWidgetEditor({
  config,
  onChange,
}: WidgetEditorProps<RichTextConfig>) {
  const t = useTranslations("admin.widgets.richText");
  const lt = useLocalized();
  const set = (patch: Partial<RichTextConfig>) => onChange({ ...config, ...patch });

  const heightMode = config.heightMode ?? "auto";
  const bg = config.bg ?? "transparent";

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Height mode */}
        <div>
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink/40">{t("heightMode")}</span>
          <div className="flex gap-1">
            {MODES.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => set({ heightMode: m })}
                className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${
                  heightMode === m ? "border-brand bg-brand/10 text-brand" : "border-ink/10 text-ink/60 hover:border-brand/40"
                }`}
              >
                {t(`mode.${m}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Container width */}
        <div>
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink/40">{t("containerWidth")}</span>
          <div className="flex gap-1">
            {(["standard", "wide", "full"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => set({ container: m })}
                className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${
                  (config.container ?? "standard") === m ? "border-brand bg-brand/10 text-brand" : "border-ink/10 text-ink/60 hover:border-brand/40"
                }`}
              >
                {t(`container.${m}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Fixed height (px) */}
        {heightMode === "fixed" && (
          <div>
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink/40">{t("height")}</span>
            <input
              type="number"
              value={config.height ?? 400}
              onChange={(e) => set({ height: Number(e.target.value) })}
              className={inputClass()}
            />
          </div>
        )}

        {/* Background */}
        <div>
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink/40">{t("bg")}</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={bg === "transparent" ? "#ffffff" : bg}
              onChange={(e) => set({ bg: e.target.value })}
              className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent p-0"
            />
            <input value={bg} onChange={(e) => set({ bg: e.target.value })} className={`${inputClass()} max-w-[110px]`} />
            <button type="button" onClick={() => set({ bg: "transparent" })} className="text-xs font-medium text-ink/40 hover:text-brand">
              {t("clearBg")}
            </button>
          </div>
        </div>
      </div>

      {/* key forces a remount when switching the language tab */}
      <RichTextEditor key={lt.locale} value={lt.g(config.html)} onChange={(html) => set({ html: lt.s(config.html, html) })} />
    </div>
  );
}
