"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Field } from "@/components/ui/Field";
import { PasswordInput } from "@/components/ui/PasswordInput";

type Errors = Partial<Record<"current" | "next" | "confirm", string>>;

export default function SecurityForm() {
  const t = useTranslations("account.security");
  const tv = useTranslations("auth.validation");

  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const validate = () => {
    const e: Errors = {};
    if (!form.current) e.current = tv("required");
    if (!form.next) e.next = tv("required");
    else if (form.next.length < 8) e.next = t("errorShort");
    if (form.confirm !== form.next) e.confirm = t("errorMismatch");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const { error } = await authClient.changePassword({
      currentPassword: form.current,
      newPassword: form.next,
      revokeOtherSessions: true,
    });
    setSaving(false);
    if (error) {
      if (error.status === 400 || (error.code ?? "").includes("PASSWORD")) {
        setErrors({ current: t("errorCurrent") });
        toast.error(t("errorCurrent"));
      } else {
        toast.error(t("errorGeneric"));
      }
      return;
    }
    setForm({ current: "", next: "", confirm: "" });
    toast.success(t("success"));
  };

  return (
    <div className="max-w-xl rounded-2xl border border-ink/5 bg-white p-7 shadow-sm">
      <h2 className="font-display text-lg font-bold text-ink">{t("title")}</h2>
      <p className="mt-1 text-sm text-ink/50">{t("desc")}</p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
        <Field label={t("currentPassword")} htmlFor="current" error={errors.current}>
          <PasswordInput id="current" value={form.current} onChange={set("current")} hasError={!!errors.current} autoComplete="current-password" />
        </Field>
        <Field label={t("newPassword")} htmlFor="next" error={errors.next}>
          <PasswordInput id="next" value={form.next} onChange={set("next")} hasError={!!errors.next} autoComplete="new-password" />
        </Field>
        <Field label={t("confirmPassword")} htmlFor="confirm" error={errors.confirm}>
          <PasswordInput id="confirm" value={form.confirm} onChange={set("confirm")} hasError={!!errors.confirm} autoComplete="new-password" />
        </Field>

        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-brand px-7 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {saving ? "…" : t("submit")}
        </button>
      </form>
    </div>
  );
}
