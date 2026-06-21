"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { MailIcon } from "@/components/icons";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { saveSmtpAction } from "@/app/admin/system/email/actions";
import TestEmailDialog from "@/components/admin/TestEmailDialog";

type Initial = {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  fromName: string;
  fromEmail: string;
  hasPassword: boolean;
};

export default function SmtpForm({ initial }: { initial: Initial }) {
  const t = useTranslations("admin.settings");

  const [form, setForm] = useState({
    host: initial.host,
    port: String(initial.port),
    secure: initial.secure,
    username: initial.username,
    password: "",
    fromName: initial.fromName,
    fromEmail: initial.fromEmail,
  });
  const [saving, setSaving] = useState(false);
  const [testOpen, setTestOpen] = useState(false);

  const update =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({
        ...f,
        [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
      }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { ok } = await saveSmtpAction(form);
      if (ok) toast.success(t("saved"));
      else toast.error(t("errorGeneric"));
    } catch {
      toast.error(t("errorGeneric"));
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
          <h2 className="font-display text-lg font-bold text-ink">{t("smtpTitle")}</h2>
          <p className="text-sm text-ink/50">{t("smtpDesc")}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t("host")} htmlFor="host">
            <input id="host" value={form.host} onChange={update("host")} placeholder="smtp.hostinger.com" className={inputCls} />
          </Field>
          <Field label={t("port")} htmlFor="port">
            <input id="port" type="number" value={form.port} onChange={update("port")} className={inputCls} />
          </Field>
          <Field label={t("username")} htmlFor="username">
            <input id="username" value={form.username} onChange={update("username")} placeholder="no-reply@mirutafit.com" className={inputCls} />
          </Field>
          <Field label={t("password")} htmlFor="password">
            <PasswordInput
              id="password"
              value={form.password}
              onChange={update("password")}
              placeholder={initial.hasPassword ? "••••••••" : ""}
            />
            <p className="mt-1 text-xs text-ink/40">{t("passwordKeep")}</p>
          </Field>
          <Field label={t("fromName")} htmlFor="fromName">
            <input id="fromName" value={form.fromName} onChange={update("fromName")} className={inputCls} />
          </Field>
          <Field label={t("fromEmail")} htmlFor="fromEmail">
            <input id="fromEmail" type="email" value={form.fromEmail} onChange={update("fromEmail")} placeholder="no-reply@mirutafit.com" className={inputCls} />
          </Field>
        </div>

        <label className="flex items-center gap-2 text-sm text-ink/70">
          <input type="checkbox" checked={form.secure} onChange={update("secure")} className="h-4 w-4 rounded border-ink/20 text-brand focus:ring-brand" />
          {t("secure")}
        </label>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-brand px-7 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {saving ? "…" : t("save")}
          </button>

          <button
            type="button"
            onClick={() => setTestOpen(true)}
            className="flex items-center gap-2 rounded-full border border-ink/10 px-5 py-2.5 text-sm font-medium text-ink/70 transition-all hover:border-brand/30 hover:text-brand hover:shadow-sm"
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
            {t("testBtn")}
          </button>
        </div>
      </form>

      <TestEmailDialog open={testOpen} onClose={() => setTestOpen(false)} />
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-ink/10 bg-gray-50 px-4 py-2.5 text-sm text-ink placeholder:text-ink/30 focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/30";

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-ink/70">
        {label}
      </label>
      {children}
    </div>
  );
}

