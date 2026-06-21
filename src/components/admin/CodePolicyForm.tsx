"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Field, inputClass } from "@/components/ui/Field";
import { saveCodePolicyAction } from "@/app/admin/system/codes/actions";
import type { CodePolicy } from "@/lib/settings";

export default function CodePolicyForm({ initial }: { initial: CodePolicy }) {
  const t = useTranslations("admin.codePolicy");
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);

  const num = (key: "length" | "expiryMinutes" | "maxAttempts") =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: Number(e.target.value) }));

  const bool = (key: "useLetters" | "useNumbers" | "useSymbols") =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.checked }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.useLetters && !form.useNumbers && !form.useSymbols) {
      toast.error(t("errorCharset"));
      return;
    }
    setSaving(true);
    try {
      const { ok } = await saveCodePolicyAction(form);
      if (ok) toast.success(t("saved"));
      else toast.error(t("errorCharset"));
    } catch {
      toast.error(t("error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6 rounded-2xl border border-ink/5 bg-white p-7 shadow-sm">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t("length")} htmlFor="length" hint={t("lengthHint")}>
          <input id="length" type="number" min={4} max={12} value={form.length} onChange={num("length")} className={inputClass()} />
        </Field>
        <Field label={t("expiryMinutes")} htmlFor="expiry">
          <input id="expiry" type="number" min={1} max={1440} value={form.expiryMinutes} onChange={num("expiryMinutes")} className={inputClass()} />
        </Field>
        <Field label={t("maxAttempts")} htmlFor="attempts">
          <input id="attempts" type="number" min={1} max={20} value={form.maxAttempts} onChange={num("maxAttempts")} className={inputClass()} />
        </Field>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-ink/70">{t("charset")}</p>
        <div className="space-y-2">
          {([
            ["useLetters", t("useLetters")],
            ["useNumbers", t("useNumbers")],
            ["useSymbols", t("useSymbols")],
          ] as const).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm text-ink/80">
              <input
                type="checkbox"
                checked={form[key]}
                onChange={bool(key)}
                className="h-4 w-4 rounded border-ink/20 text-brand focus:ring-brand"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

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
