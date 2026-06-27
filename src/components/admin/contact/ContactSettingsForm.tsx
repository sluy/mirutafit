"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { MailIcon } from "@/components/icons";
import { inputClass } from "@/components/ui/Field";
import { saveContactSettingsAction } from "@/app/admin/contact/actions";
import type { ContactSettings } from "@/lib/settings";

export default function ContactSettingsForm({ initial }: { initial: ContactSettings }) {
  const t = useTranslations("admin.contact");
  const [form, setForm] = useState<ContactSettings>(initial);
  const [saving, setSaving] = useState(false);

  const update = (patch: Partial<ContactSettings>) => setForm((f) => ({ ...f, ...patch }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { ok } = await saveContactSettingsAction(form);
      if (ok) toast.success(t("saved"));
      else toast.error(t("error"));
    } catch {
      toast.error(t("error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl rounded-2xl border border-ink/5 bg-white p-7 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand/10 text-brand">
          <MailIcon width={18} height={18} />
        </span>
        <div>
          <h2 className="font-display text-lg font-bold text-ink">{t("settingsTitle")}</h2>
          <p className="text-sm text-ink/50">{t("settingsDesc")}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label={t("recipientEmail")} hint={t("recipientHint")}>
          <input
            type="email"
            value={form.recipientEmail}
            onChange={(e) => update({ recipientEmail: e.target.value })}
            placeholder="sluy1283@gmail.com"
            className={inputClass()}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t("fromEmail")} hint={t("fromHint")}>
            <input
              type="email"
              value={form.fromEmail}
              onChange={(e) => update({ fromEmail: e.target.value })}
              placeholder="contacto@mirutafit.com"
              className={inputClass()}
            />
          </Field>
          <Field label={t("fromName")}>
            <input
              value={form.fromName}
              onChange={(e) => update({ fromName: e.target.value })}
              placeholder="MiRutaFit"
              className={inputClass()}
            />
          </Field>
        </div>

        <label className="flex items-center gap-2 text-sm text-ink/70">
          <input
            type="checkbox"
            checked={form.notify}
            onChange={(e) => update({ notify: e.target.checked })}
            className="h-4 w-4 rounded border-ink/20 text-brand focus:ring-brand"
          />
          {t("notify")}
        </label>
        <p className="-mt-3 text-xs text-ink/40">{t("notifyHint")}</p>

        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-brand px-7 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {saving ? "…" : t("save")}
        </button>
      </form>
    </div>
  );
}

function Field({
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
      <label className="mb-1.5 block text-sm font-medium text-ink/70">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-ink/40">{hint}</p>}
    </div>
  );
}
