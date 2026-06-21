"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { signUp } from "@/lib/auth-client";
import { Field, inputClass } from "@/components/ui/Field";
import { PasswordInput } from "@/components/ui/PasswordInput";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = Partial<Record<"name" | "email" | "password", string>>;

export default function RegisterForm() {
  const t = useTranslations("auth");
  const tv = useTranslations("auth.validation");
  const tr = useTranslations("auth.register");
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    country: "",
    phone: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (key in errors) setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const validate = () => {
    const e: Errors = {};
    if (!form.name.trim()) e.name = tv("required");
    if (!form.email.trim()) e.email = tv("required");
    else if (!EMAIL_RE.test(form.email)) e.email = tv("emailInvalid");
    if (!form.password) e.password = tv("required");
    else if (form.password.length < 8) e.password = tv("passwordShort");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const { error } = await signUp.email({
      email: form.email,
      password: form.password,
      name: form.name,
      firstName: form.firstName || undefined,
      lastName: form.lastName || undefined,
      country: form.country || undefined,
      phone: form.phone || undefined,
    });

    if (error) {
      setLoading(false);
      const code = error.code ?? "";
      if (code.includes("REGISTRATION_DISABLED")) {
        toast.error(tr("errorDisabled"));
      } else if (code.includes("EXIST") || error.status === 422) {
        setErrors({ email: tr("errorEmailExists") });
        toast.error(tr("errorEmailExists"));
      } else {
        toast.error(tr("errorGeneric"));
      }
      return;
    }

    toast.success(tr("success"));
    router.push("/");
    router.refresh();
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-ink">{tr("title")}</h1>
      <p className="mt-1 text-sm text-ink/60">{tr("subtitle")}</p>

      <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-4">
        <Field label={tr("nameLabel")} htmlFor="name" error={errors.name}>
          <input id="name" value={form.name} onChange={set("name")} placeholder={tr("namePlaceholder")} className={inputClass(!!errors.name)} />
        </Field>
        <Field label={t("emailLabel")} htmlFor="email" error={errors.email}>
          <input id="email" type="email" value={form.email} onChange={set("email")} placeholder={t("emailPlaceholder")} className={inputClass(!!errors.email)} />
        </Field>
        <Field label={t("passwordLabel")} htmlFor="password" error={errors.password}>
          <PasswordInput id="password" value={form.password} onChange={set("password")} placeholder={t("passwordPlaceholder")} hasError={!!errors.password} autoComplete="new-password" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label={`${tr("firstNameLabel")} (${tr("optional")})`} htmlFor="firstName">
            <input id="firstName" value={form.firstName} onChange={set("firstName")} className={inputClass()} />
          </Field>
          <Field label={`${tr("lastNameLabel")} (${tr("optional")})`} htmlFor="lastName">
            <input id="lastName" value={form.lastName} onChange={set("lastName")} className={inputClass()} />
          </Field>
          <Field label={`${tr("countryLabel")} (${tr("optional")})`} htmlFor="country">
            <input id="country" value={form.country} onChange={set("country")} className={inputClass()} />
          </Field>
          <Field label={`${tr("phoneLabel")} (${tr("optional")})`} htmlFor="phone">
            <input id="phone" type="tel" value={form.phone} onChange={set("phone")} className={inputClass()} />
          </Field>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-brand py-3 font-semibold text-white shadow-lg shadow-brand/30 transition-transform hover:scale-[1.01] disabled:opacity-60"
        >
          {loading ? "…" : tr("submit")}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/60">
        {tr("haveAccount")}{" "}
        <Link href="/login" className="font-semibold text-brand hover:underline">
          {tr("loginLink")}
        </Link>
      </p>
    </div>
  );
}
