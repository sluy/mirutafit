"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { setRegistrationAction } from "@/app/admin/users/settings/actions";

export default function RegistrationToggle({ initial }: { initial: boolean }) {
  const t = useTranslations("admin.usersSettings");
  const [enabled, setEnabled] = useState(initial);
  const [saving, setSaving] = useState(false);

  const toggle = async () => {
    const next = !enabled;
    setSaving(true);
    setEnabled(next); // optimistic
    try {
      const { ok } = await setRegistrationAction(next);
      if (!ok) throw new Error();
      toast.success(t("saved"));
    } catch {
      setEnabled(!next); // revert
      toast.error(t("error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <span className={`text-sm font-medium ${enabled ? "text-brand" : "text-ink/40"}`}>
        {enabled ? t("enabled") : t("disabled")}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        disabled={saving}
        onClick={toggle}
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors disabled:opacity-60 ${
          enabled ? "bg-brand" : "bg-ink/20"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
