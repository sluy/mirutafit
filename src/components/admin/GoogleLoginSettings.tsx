"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { inputClass } from "@/components/ui/Field";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { saveGoogleOauthAction } from "@/app/admin/users/settings/actions";

export default function GoogleLoginSettings({
  initial,
}: {
  initial: { googleEnabled: boolean; googleClientId: string; hasSecret: boolean };
}) {
  const t = useTranslations("admin.usersSettings");
  const [enabled, setEnabled] = useState(initial.googleEnabled);
  const [clientId, setClientId] = useState(initial.googleClientId);
  const [secret, setSecret] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { ok } = await saveGoogleOauthAction({
        googleEnabled: enabled,
        googleClientId: clientId,
        googleClientSecret: secret,
      });
      if (ok) {
        toast.success(t("saved"));
        setSecret("");
      } else toast.error(t("error"));
    } catch {
      toast.error(t("error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="space-y-5">
      <div className="flex items-center justify-between gap-6">
        <div>
          <p className="font-display font-bold text-ink">{t("googleTitle")}</p>
          <p className="mt-1 text-sm text-ink/50">{t("googleDesc")}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => setEnabled((v) => !v)}
          className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${enabled ? "bg-brand" : "bg-ink/20"}`}
        >
          <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-6" : "translate-x-1"}`} />
        </button>
      </div>

      <div>
        <label htmlFor="g-id" className="mb-1.5 block text-sm font-medium text-ink/70">{t("googleClientId")}</label>
        <input id="g-id" value={clientId} onChange={(e) => setClientId(e.target.value)} placeholder="…apps.googleusercontent.com" className={inputClass()} />
      </div>
      <div>
        <label htmlFor="g-secret" className="mb-1.5 block text-sm font-medium text-ink/70">{t("googleClientSecret")}</label>
        <PasswordInput id="g-secret" value={secret} onChange={(e) => setSecret(e.target.value)} placeholder={initial.hasSecret ? "••••••••" : ""} />
        <p className="mt-1 text-xs text-ink/40">{t("googleSecretKeep")}</p>
      </div>

      <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">{t("googleRestartHint")}</p>

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
