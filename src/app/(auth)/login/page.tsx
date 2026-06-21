"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { signIn } from "@/lib/auth-client";
import { Field, inputClass } from "@/components/ui/Field";
import { PasswordInput } from "@/components/ui/PasswordInput";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const t = useTranslations("auth");
  const tv = useTranslations("auth.validation");
  const tl = useTranslations("auth.login");
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = tv("required");
    else if (!EMAIL_RE.test(email)) e.email = tv("emailInvalid");
    if (!password) e.password = tv("required");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const { error } = await signIn.email({ email, password });

    if (error) {
      setLoading(false);
      const code = error.code ?? "";
      if (code.includes("BANNED")) {
        toast.error(tl("errorBanned"));
      } else if (code.includes("INVALID") || error.status === 401) {
        setErrors({ email: " ", password: tl("errorInvalid") });
        toast.error(tl("errorInvalid"));
      } else {
        toast.error(tl("errorGeneric"));
      }
      return;
    }

    toast.success(tl("success"));
    router.push("/");
    router.refresh();
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-ink">{tl("title")}</h1>
      <p className="mt-1 text-sm text-ink/60">{tl("subtitle")}</p>

      <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-4">
        <Field label={t("emailLabel")} htmlFor="email" error={errors.email}>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors((p) => ({ ...p, email: undefined }));
            }}
            placeholder={t("emailPlaceholder")}
            className={inputClass(!!errors.email)}
          />
        </Field>
        <Field label={t("passwordLabel")} htmlFor="password" error={errors.password}>
          <PasswordInput
            id="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors((p) => ({ ...p, password: undefined }));
            }}
            placeholder={t("passwordPlaceholder")}
            hasError={!!errors.password}
            autoComplete="current-password"
          />
        </Field>

        <div className="text-right">
          <Link href="/forgot-password" className="text-sm font-medium text-brand hover:underline">
            {tl("forgotPassword")}
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-brand py-3 font-semibold text-white shadow-lg shadow-brand/30 transition-transform hover:scale-[1.01] disabled:opacity-60"
        >
          {loading ? "…" : tl("submit")}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/60">
        {tl("noAccount")}{" "}
        <Link href="/register" className="font-semibold text-brand hover:underline">
          {tl("signupLink")}
        </Link>
      </p>
    </div>
  );
}
