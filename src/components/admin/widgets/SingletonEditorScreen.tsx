"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { WIDGET_EDITORS } from "@/widgets/editors";
import type { WidgetTypeKey } from "@/widgets/meta";

/** Admin editor for singleton widgets (navbar / footer). Config is loaded from
 *  and saved to system_setting, not the widget table. */
export default function SingletonEditorScreen({
  type,
  initialConfig,
  saveAction,
}: {
  type: WidgetTypeKey;
  initialConfig: Record<string, unknown>;
  saveAction: (config: Record<string, unknown>) => Promise<{ ok: boolean }>;
}) {
  const t = useTranslations("admin.widgets");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [config, setConfig] = useState<any>(initialConfig);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setConfig(initialConfig);
  }, [initialConfig]);

  const Editor = WIDGET_EDITORS[type];

  const save = async () => {
    setSaving(true);
    const { ok } = await saveAction(config);
    setSaving(false);
    if (ok) {
      toast.success(t("saved"));
    } else {
      toast.error(t("error"));
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-ink">
            {t(`types.${type}`)}
          </h1>
          <p className="mt-1 text-sm text-ink/50">
            {t("singletonHint")}
          </p>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition-transform hover:scale-105 disabled:opacity-60"
        >
          {saving ? "…" : t("save")}
        </button>
      </div>

      <div className="rounded-2xl border border-ink/5 bg-white p-6 shadow-sm">
        <Editor config={config} onChange={setConfig} />
      </div>
    </div>
  );
}
