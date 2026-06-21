"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Field, inputClass } from "@/components/ui/Field";

type Initial = {
  name: string;
  email: string;
  firstName: string;
  lastName: string;
  country: string;
  phone: string;
};

export default function ProfileForm({ initial }: { initial: Initial }) {
  const t = useTranslations("account.profile");
  const tv = useTranslations("auth.validation");
  const router = useRouter();

  const [form, setForm] = useState(initial);
  const [nameError, setNameError] = useState<string>();
  const [saving, setSaving] = useState(false);

  const set = (key: keyof Initial) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (key === "name") setNameError(undefined);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setNameError(tv("required"));
      return;
    }
    setSaving(true);
    const { error } = await authClient.updateUser({
      name: form.name.trim(),
      firstName: form.firstName || undefined,
      lastName: form.lastName || undefined,
      country: form.country || undefined,
      phone: form.phone || undefined,
    });
    setSaving(false);
    if (error) {
      toast.error(t("error"));
      return;
    }
    toast.success(t("saved"));
    router.refresh();
  };

  return (
    <div className="max-w-xl rounded-2xl border border-ink/5 bg-white p-7 shadow-sm">
      <h2 className="mb-6 font-display text-lg font-bold text-ink">{t("title")}</h2>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Field label={t("emailLabel")} htmlFor="email" hint={t("emailHint")}>
          <input id="email" value={form.email} disabled className={`${inputClass()} cursor-not-allowed opacity-60`} />
        </Field>
        <Field label={t("nameLabel")} htmlFor="name" error={nameError}>
          <input id="name" value={form.name} onChange={set("name")} className={inputClass(!!nameError)} />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t("firstNameLabel")} htmlFor="firstName">
            <input id="firstName" value={form.firstName} onChange={set("firstName")} className={inputClass()} />
          </Field>
          <Field label={t("lastNameLabel")} htmlFor="lastName">
            <input id="lastName" value={form.lastName} onChange={set("lastName")} className={inputClass()} />
          </Field>
          <Field label={t("countryLabel")} htmlFor="country">
            <input id="country" value={form.country} onChange={set("country")} className={inputClass()} />
          </Field>
          <Field label={t("phoneLabel")} htmlFor="phone">
            <input id="phone" type="tel" value={form.phone} onChange={set("phone")} className={inputClass()} />
          </Field>
        </div>

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
