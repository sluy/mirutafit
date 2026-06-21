"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Field, inputClass } from "@/components/ui/Field";
import { PasswordInput } from "@/components/ui/PasswordInput";
import {
  requestResetAction,
  verifyResetCodeAction,
  resetPasswordAction,
} from "./actions";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
type Step = "email" | "code" | "password";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const tv = useTranslations("auth.validation");
  const tf = useTranslations("auth.forgot");
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  // Maps a verification result to its localized message.
  const codeError = (status: string) =>
    ({
      invalid: tf("codeStep.errorInvalid"),
      expired: tf("codeStep.errorExpired"),
      too_many_attempts: tf("codeStep.errorTooMany"),
      not_found: tf("codeStep.errorNotFound"),
    })[status] ?? tf("passwordStep.errorGeneric");

  // ── Step 1: request a code ──
  const submitEmail = async (e: FormEvent) => {
    e.preventDefault();
    setError(undefined);
    if (!EMAIL_RE.test(email)) return setError(tv("emailInvalid"));
    setLoading(true);
    const res = await requestResetAction(email);
    setLoading(false);
    if (!res.ok) {
      if (res.reason === "not_found") setError(tf("emailStep.errorNotFound"));
      else toast.error(tf("emailStep.errorSend"));
      return;
    }
    setStep("code");
  };

  // ── Step 2: verify the code ──
  const submitCode = async (e: FormEvent) => {
    e.preventDefault();
    setError(undefined);
    if (!code.trim()) return setError(tv("required"));
    setLoading(true);
    const { status } = await verifyResetCodeAction(email, code);
    setLoading(false);
    if (status !== "ok") return setError(codeError(status));
    setStep("password");
  };

  const resend = async () => {
    setError(undefined);
    setLoading(true);
    const res = await requestResetAction(email);
    setLoading(false);
    if (res.ok) toast.success(tf("codeStep.resent"));
    else toast.error(tf("emailStep.errorSend"));
  };

  // ── Step 3: set the new password ──
  const submitPassword = async (e: FormEvent) => {
    e.preventDefault();
    setError(undefined);
    if (password.length < 8) return setError(tf("passwordStep.errorShort"));
    if (password !== confirm) return setError(tf("passwordStep.errorMismatch"));
    setLoading(true);
    const res = await resetPasswordAction(email, code, password);
    setLoading(false);
    if (!res.ok) return setError(codeError(res.status));
    toast.success(tf("passwordStep.success"));
    router.push("/login");
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-ink">{tf("title")}</h1>

      {step === "email" && (
        <form onSubmit={submitEmail} noValidate className="mt-2">
          <p className="text-sm text-ink/60">{tf("emailStep.subtitle")}</p>
          <div className="mt-6 space-y-4">
            <Field label={t("emailLabel")} htmlFor="email" error={error}>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(undefined);
                }}
                placeholder={t("emailPlaceholder")}
                className={inputClass(!!error)}
              />
            </Field>
            <SubmitButton loading={loading} label={tf("emailStep.submit")} loadingLabel={tf("emailStep.sending")} />
          </div>
        </form>
      )}

      {step === "code" && (
        <form onSubmit={submitCode} noValidate className="mt-2">
          <p className="text-sm text-ink/60">{tf("codeStep.subtitle", { email })}</p>
          <div className="mt-6 space-y-4">
            <Field label={tf("codeStep.label")} htmlFor="code" error={error}>
              <input
                id="code"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError(undefined);
                }}
                autoComplete="one-time-code"
                className={`${inputClass(!!error)} text-center text-lg font-bold tracking-[0.5em]`}
              />
            </Field>
            <SubmitButton loading={loading} label={tf("codeStep.submit")} loadingLabel="…" />
            <button
              type="button"
              onClick={resend}
              disabled={loading}
              className="w-full text-center text-sm font-medium text-brand hover:underline disabled:opacity-60"
            >
              {tf("codeStep.resend")}
            </button>
          </div>
        </form>
      )}

      {step === "password" && (
        <form onSubmit={submitPassword} noValidate className="mt-2">
          <p className="text-sm text-ink/60">{tf("passwordStep.subtitle")}</p>
          <div className="mt-6 space-y-4">
            <Field label={tf("passwordStep.newPassword")} htmlFor="new" error={error}>
              <PasswordInput
                id="new"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(undefined);
                }}
                hasError={!!error}
                autoComplete="new-password"
              />
            </Field>
            <Field label={tf("passwordStep.confirmPassword")} htmlFor="confirm">
              <PasswordInput
                id="confirm"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
              />
            </Field>
            <SubmitButton loading={loading} label={tf("passwordStep.submit")} loadingLabel="…" />
          </div>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-ink/60">
        <Link href="/login" className="font-semibold text-brand hover:underline">
          {tf("backToLogin")}
        </Link>
      </p>
    </div>
  );
}

function SubmitButton({
  loading,
  label,
  loadingLabel,
}: {
  loading: boolean;
  label: string;
  loadingLabel: string;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full rounded-full bg-brand py-3 font-semibold text-white shadow-lg shadow-brand/30 transition-transform hover:scale-[1.01] disabled:opacity-60"
    >
      {loading ? loadingLabel : label}
    </button>
  );
}
