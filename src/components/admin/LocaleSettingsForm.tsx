"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { GlobeIcon } from "@/components/icons";
import { inputClass } from "@/components/ui/Field";
import type { LocaleSettings } from "@/lib/settings";
import { saveLocaleSettingsAction } from "@/app/admin/system/languages/actions";

type LocaleOpt = { code: string; label: string };

export default function LocaleSettingsForm({
  initial,
  available,
}: {
  initial: LocaleSettings;
  available: LocaleOpt[];
}) {
  const t = useTranslations("admin.locales");
  const [form, setForm] = useState<LocaleSettings>(initial);
  const [saving, setSaving] = useState(false);
  const set = (patch: Partial<LocaleSettings>) => setForm((f) => ({ ...f, ...patch }));

  const toggleEnabled = (code: string) => {
    const enabled = form.enabled.includes(code)
      ? form.enabled.filter((c) => c !== code)
      : [...form.enabled, code];
    set({ enabled, fallback: enabled.includes(form.fallback) ? form.fallback : enabled[0] ?? form.fallback });
  };

  const save = async () => {
    setSaving(true);
    try {
      const { ok } = await saveLocaleSettingsAction(form);
      if (ok) toast.success(t("saved"));
      else toast.error(t("error"));
    } catch {
      toast.error(t("error"));
    } finally {
      setSaving(false);
    }
  };

  const enabledOpts = available.filter((a) => form.enabled.includes(a.code));

  return (
    <div className="mb-8 max-w-2xl rounded-2xl border border-ink/5 bg-white p-7 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand/10 text-brand">
          <GlobeIcon width={18} height={18} />
        </span>
        <div>
          <h2 className="font-display text-lg font-bold text-ink">{t("title")}</h2>
          <p className="text-sm text-ink/50">{t("desc")}</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Mode */}
        <div>
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/40">{t("mode")}</span>
          <div className="flex gap-2">
            <button type="button" onClick={() => set({ mode: "single" })} className={`rounded-xl border px-5 py-2 text-sm font-medium transition-colors ${form.mode === "single" ? "border-brand bg-brand/10 text-brand" : "border-ink/10 text-ink/60 hover:border-brand/40"}`}>{t("single")}</button>
            <button type="button" onClick={() => set({ mode: "multi" })} className={`rounded-xl border px-5 py-2 text-sm font-medium transition-colors ${form.mode === "multi" ? "border-brand bg-brand/10 text-brand" : "border-ink/10 text-ink/60 hover:border-brand/40"}`}>{t("multi")}</button>
          </div>
          <p className="mt-1 text-xs text-ink/40">{form.mode === "single" ? t("singleHint") : t("multiHint")}</p>
        </div>

        {form.mode === "single" ? (
          <div>
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/40">{t("language")}</span>
            <select value={form.single} onChange={(e) => set({ single: e.target.value })} className={`${inputClass()} max-w-xs`}>
              {available.map((a) => (<option key={a.code} value={a.code}>{a.label}</option>))}
            </select>
          </div>
        ) : (
          <>
            <div>
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/40">{t("enabled")}</span>
              <div className="flex flex-wrap gap-2">
                {available.map((a) => {
                  const on = form.enabled.includes(a.code);
                  return (
                    <button key={a.code} type="button" onClick={() => toggleEnabled(a.code)} className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${on ? "bg-brand text-white" : "bg-ink/5 text-ink/60 hover:bg-brand/10 hover:text-brand"}`}>
                      {a.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/40">{t("fallback")}</span>
              <select value={form.fallback} onChange={(e) => set({ fallback: e.target.value })} className={`${inputClass()} max-w-xs`}>
                {enabledOpts.map((a) => (<option key={a.code} value={a.code}>{a.label}</option>))}
              </select>
              <p className="mt-1 text-xs text-ink/40">{t("fallbackHint")}</p>
            </div>
          </>
        )}

        <button type="button" onClick={save} disabled={saving} className="rounded-full bg-brand px-7 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition-transform hover:scale-[1.02] disabled:opacity-60">
          {saving ? "…" : t("save")}
        </button>
      </div>
    </div>
  );
}
