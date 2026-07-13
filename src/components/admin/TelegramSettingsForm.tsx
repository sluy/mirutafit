"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Field, inputClass } from "@/components/ui/Field";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { saveTelegramAction, testTelegramAction } from "@/app/admin/system/telegram/actions";
import type { TelegramSettings } from "@/lib/settings";

export default function TelegramSettingsForm({ settings }: { settings: TelegramSettings }) {
  const t = useTranslations("admin.telegram");
  const [data, setData] = useState<TelegramSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const set = (patch: Partial<TelegramSettings>) => setData((d) => ({ ...d, ...patch }));

  const save = async () => {
    setSaving(true);
    try {
      const res = await saveTelegramAction(data);
      if (res.ok) toast.success(t("saved"));
      else toast.error(t("error"));
    } finally {
      setSaving(false);
    }
  };

  const test = async () => {
    if (!data.botToken.trim() || !data.chatId.trim()) {
      toast.error(t("missing"));
      return;
    }
    setTesting(true);
    try {
      const res = await testTelegramAction(data.botToken, data.chatId);
      if (res.ok) toast.success(t("testOk"));
      else toast.error(`${t("testFail")}: ${res.error ?? ""}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <section className="rounded-2xl border border-ink/5 bg-white p-6 shadow-sm">

      <label className="mb-5 flex cursor-pointer items-start gap-3 rounded-xl border border-ink/10 bg-ink/[0.02] p-4">
        <input
          type="checkbox"
          checked={data.enabled}
          onChange={(e) => set({ enabled: e.target.checked })}
          className="mt-0.5 h-4 w-4 rounded border-ink/20 text-brand focus:ring-brand"
        />
        <span>
          <span className="block text-sm font-medium text-ink/80">{t("enabled")}</span>
          <span className="mt-0.5 block text-xs text-ink/40">{t("enabledHint")}</span>
        </span>
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t("botToken")} htmlFor="tg-token" hint={t("botTokenHint")}>
          <PasswordInput
            id="tg-token"
            value={data.botToken}
            onChange={(e) => set({ botToken: e.target.value })}
            placeholder="123456789:AA…"
            autoComplete="off"
          />
        </Field>
        <Field label={t("chatId")} htmlFor="tg-chat" hint={t("chatIdHint")}>
          <input
            id="tg-chat"
            value={data.chatId}
            onChange={(e) => set({ chatId: e.target.value })}
            placeholder="123456789"
            className={inputClass()}
          />
        </Field>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition-transform hover:scale-105 disabled:opacity-60"
        >
          {saving ? "…" : t("save")}
        </button>
        <button
          type="button"
          onClick={test}
          disabled={testing}
          className="rounded-full border border-ink/10 bg-white px-6 py-2.5 text-sm font-semibold text-ink/70 shadow-sm transition-all hover:border-brand/30 hover:text-brand disabled:opacity-60"
        >
          {testing ? "…" : t("test")}
        </button>
      </div>
    </section>
  );
}
