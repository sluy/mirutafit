"use client";

import { useTranslations } from "next-intl";
import { inputClass } from "@/components/ui/Field";
import { TrashIcon, ArrowRightIcon } from "@/components/icons";
import { useLocalized } from "../LocaleContext";
import type { DonationMethod, DonationsConfig, WidgetEditorProps } from "../types";

function newMethod(): DonationMethod {
  return { id: crypto.randomUUID(), name: "", detail: "", color: "#10b981", link: "" };
}

export default function DonationsWidgetEditor({
  config,
  onChange,
}: WidgetEditorProps<DonationsConfig>) {
  const t = useTranslations("admin.widgets.donations");
  const lt = useLocalized();
  const set = (patch: Partial<DonationsConfig>) => onChange({ ...config, ...patch });

  const setMethod = (id: string, patch: Partial<DonationMethod>) =>
    set({ methods: config.methods.map((m) => (m.id === id ? { ...m, ...patch } : m)) });

  const addMethod = () => set({ methods: [...config.methods, newMethod()] });
  const removeMethod = (id: string) =>
    set({ methods: config.methods.filter((m) => m.id !== id) });

  const move = (index: number, dir: -1 | 1) => {
    const next = [...config.methods];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    set({ methods: next });
  };

  return (
    <div className="space-y-6">
      {/* Texts */}
      <Labeled label={t("eyebrow")}>
        <input value={lt.g(config.eyebrow)} onChange={(e) => set({ eyebrow: lt.s(config.eyebrow, e.target.value) })} className={inputClass()} />
      </Labeled>
      <Labeled label={t("heading")}>
        <input value={lt.g(config.heading)} onChange={(e) => set({ heading: lt.s(config.heading, e.target.value) })} className={inputClass()} />
      </Labeled>
      <Labeled label={t("text")}>
        <textarea value={lt.g(config.text)} onChange={(e) => set({ text: lt.s(config.text, e.target.value) })} rows={3} className={`${inputClass()} resize-none`} />
      </Labeled>

      {/* Background & Size */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Labeled label={t("bg")}>
          <div className="flex items-center gap-2">
            <input type="color" value={config.bg || "#0a1410"} onChange={(e) => set({ bg: e.target.value })} className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent p-0" />
            <input value={config.bg} onChange={(e) => set({ bg: e.target.value })} className={`${inputClass()} max-w-[160px]`} />
          </div>
        </Labeled>

        <div>
          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-ink/40">{t("size")}</span>
          <label className="flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-ink/10 px-3 hover:bg-ink/5">
            <input
              type="checkbox"
              checked={config.fullHeight ?? false}
              onChange={(e) => set({ fullHeight: e.target.checked })}
              className="h-4 w-4 rounded border-ink/20 text-brand focus:ring-brand"
            />
            <span className="text-sm font-medium">{t("fullHeight")}</span>
          </label>
        </div>
      </div>

      {/* Methods */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink/40">{t("methods")}</span>
          <button
            type="button"
            onClick={addMethod}
            className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand hover:bg-brand/20"
          >
            + {t("addMethod")}
          </button>
        </div>

        {config.methods.length === 0 ? (
          <p className="rounded-xl border border-dashed border-ink/15 p-4 text-center text-xs text-ink/40">{t("noMethods")}</p>
        ) : (
          <div className="space-y-3">
            {config.methods.map((m, i) => (
              <div key={m.id} className="rounded-xl border border-ink/10 bg-gray-50 p-3">
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm font-bold text-white"
                    style={{ backgroundColor: m.color || "#10b981" }}
                  >
                    {(m.name || "?").charAt(0).toUpperCase()}
                  </span>
                  <input
                    value={m.name}
                    onChange={(e) => setMethod(m.id, { name: e.target.value })}
                    placeholder={t("methodName")}
                    className={`${inputClass()} flex-1`}
                  />
                  <input
                    type="color"
                    value={m.color || "#10b981"}
                    onChange={(e) => setMethod(m.id, { color: e.target.value })}
                    title={t("methodColor")}
                    className="h-9 w-9 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0"
                  />
                  <div className="flex shrink-0 flex-col">
                    <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="px-1 text-ink/40 hover:text-brand disabled:opacity-30">
                      <ArrowRightIcon width={13} height={13} className="-rotate-90" />
                    </button>
                    <button type="button" onClick={() => move(i, 1)} disabled={i === config.methods.length - 1} className="px-1 text-ink/40 hover:text-brand disabled:opacity-30">
                      <ArrowRightIcon width={13} height={13} className="rotate-90" />
                    </button>
                  </div>
                  <button type="button" onClick={() => removeMethod(m.id)} className="shrink-0 rounded-lg p-2 text-ink/30 hover:bg-red-50 hover:text-red-600" title={t("removeMethod")}>
                    <TrashIcon width={15} height={15} />
                  </button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    value={m.detail}
                    onChange={(e) => setMethod(m.id, { detail: e.target.value })}
                    placeholder={t("methodDetail")}
                    className={inputClass()}
                  />
                  <input
                    value={m.link}
                    onChange={(e) => setMethod(m.id, { link: e.target.value })}
                    placeholder={t("methodLink")}
                    className={inputClass()}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="mt-2 text-xs text-ink/40">{t("methodLinkHint")}</p>
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
