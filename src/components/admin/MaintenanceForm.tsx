"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { inputClass } from "@/components/ui/Field";
import type { MaintenanceSettings } from "@/lib/settings";
import { saveMaintenanceAction } from "@/app/admin/system/maintenance/actions";

export default function MaintenanceForm({ initial }: { initial: MaintenanceSettings }) {
  const t = useTranslations("admin.maintenance");
  const [form, setForm] = useState<MaintenanceSettings>(initial);
  const [saving, setSaving] = useState(false);
  const set = (patch: Partial<MaintenanceSettings>) => setForm((f) => ({ ...f, ...patch }));

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { ok } = await saveMaintenanceAction(form);
      if (ok) toast.success(t("saved"));
      else toast.error(t("error"));
    } catch {
      toast.error(t("error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="max-w-2xl space-y-5 rounded-2xl border border-ink/5 bg-white p-7 shadow-sm">
      <div className="flex items-center justify-between gap-6">
        <div>
          <p className="font-display font-bold text-ink">{t("toggleTitle")}</p>
          <p className="mt-1 text-sm text-ink/50">{form.enabled ? t("onHint") : t("offHint")}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={form.enabled}
          onClick={() => set({ enabled: !form.enabled })}
          className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${form.enabled ? "bg-amber-500" : "bg-ink/20"}`}
        >
          <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${form.enabled ? "translate-x-6" : "translate-x-1"}`} />
        </button>
      </div>

      {form.enabled && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">{t("liveWarning")}</p>
      )}

      <div>
        <label htmlFor="m-title" className="mb-1.5 block text-sm font-medium text-ink/70">{t("messageTitle")}</label>
        <input id="m-title" value={form.title} onChange={(e) => set({ title: e.target.value })} className={inputClass()} />
      </div>
      <div>
        <label htmlFor="m-msg" className="mb-1.5 block text-sm font-medium text-ink/70">{t("messageBody")}</label>
        <textarea id="m-msg" value={form.message} onChange={(e) => set({ message: e.target.value })} rows={3} className={`${inputClass()} resize-none`} />
      </div>

      <p className="text-xs text-ink/40">{t("surveysNote")}</p>

      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-brand px-7 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition-transform hover:scale-[1.02] disabled:opacity-60"
      >
        {saving ? "…" : t("save")}
      </button>
    </form>
  );
}
