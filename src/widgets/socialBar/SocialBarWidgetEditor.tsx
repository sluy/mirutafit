"use client";

import { useTranslations } from "next-intl";
import { inputClass } from "@/components/ui/Field";
import type { SocialBarConfig, WidgetEditorProps } from "../types";

const CHECKER: React.CSSProperties = {
  backgroundImage: "repeating-conic-gradient(#e5e7eb 0% 25%, #ffffff 0% 50%)",
  backgroundSize: "20px 20px",
};

export default function SocialBarWidgetEditor({
  config,
  onChange,
}: WidgetEditorProps<SocialBarConfig>) {
  const t = useTranslations("admin.widgets.socialBar");
  const set = (patch: Partial<SocialBarConfig>) => onChange({ ...config, ...patch });

  const alignClass =
    config.align === "left" ? "justify-start" : config.align === "center" ? "justify-center" : "justify-end";

  return (
    <div className="space-y-6">
      {/* Mode */}
      <ModeToggle fixed={config.fixed} onChange={(fixed) => set({ fixed })} labels={{ title: t("mode"), normal: t("modeNormal"), fixed: t("modeFixed") }} />

      <div className="grid gap-4 sm:grid-cols-4">
        <div>
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink/40">{t("bg")}</span>
          <div className="flex items-center gap-2">
            <input type="color" value={config.bg} onChange={(e) => set({ bg: e.target.value })} className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent p-0" />
            <input value={config.bg} onChange={(e) => set({ bg: e.target.value })} className={`${inputClass()} max-w-[120px]`} />
          </div>
        </div>
        <div>
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink/40">{t("text")}</span>
          <div className="flex items-center gap-2">
            <input type="color" value={config.text} onChange={(e) => set({ text: e.target.value })} className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent p-0" />
            <input value={config.text} onChange={(e) => set({ text: e.target.value })} className={`${inputClass()} max-w-[120px]`} />
          </div>
        </div>
        <div>
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink/40">{t("hover")}</span>
          <div className="flex items-center gap-2">
            <input type="color" value={config.hover ?? "#16c47f"} onChange={(e) => set({ hover: e.target.value })} className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent p-0" />
            <input value={config.hover ?? "#16c47f"} onChange={(e) => set({ hover: e.target.value })} className={`${inputClass()} max-w-[120px]`} />
          </div>
        </div>
        <div>
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink/40">{t("alignLabel")}</span>
          <div className="flex gap-1">
            {(["left", "center", "right"] as const).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => set({ align: a })}
                className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${
                  config.align === a ? "border-brand bg-brand/10 text-brand" : "border-ink/10 text-ink/60 hover:border-brand/40"
                }`}
              >
                {t(`align.${a}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Preview */}
      <div>
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink/40">{t("preview")}</span>
        <div className="overflow-hidden rounded-xl border border-ink/10 p-3" style={CHECKER}>
          <div className="rounded-lg" style={{ backgroundColor: config.bg, color: config.text }}>
            <div className={`flex items-center gap-3 px-4 py-2.5 ${alignClass}`}>
              <span className="h-4 w-4 rounded-full bg-current opacity-80" />
              <span className="h-4 w-4 rounded-full bg-current opacity-80" />
              <span className="h-4 w-4 rounded-full bg-current opacity-80" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModeToggle({
  fixed,
  onChange,
  labels,
}: {
  fixed: boolean;
  onChange: (fixed: boolean) => void;
  labels: { title: string; normal: string; fixed: string };
}) {
  return (
    <div>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/40">{labels.title}</span>
      <div className="flex gap-2">
        <button type="button" onClick={() => onChange(false)} className={`rounded-xl border px-5 py-2 text-sm font-medium transition-colors ${!fixed ? "border-brand bg-brand/10 text-brand" : "border-ink/10 text-ink/60 hover:border-brand/40"}`}>
          {labels.normal}
        </button>
        <button type="button" onClick={() => onChange(true)} className={`rounded-xl border px-5 py-2 text-sm font-medium transition-colors ${fixed ? "border-brand bg-brand/10 text-brand" : "border-ink/10 text-ink/60 hover:border-brand/40"}`}>
          {labels.fixed}
        </button>
      </div>
    </div>
  );
}
