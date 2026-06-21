"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { inputClass } from "@/components/ui/Field";
import { ArrowRightIcon } from "@/components/icons";
import { WIDGET_EDITORS } from "@/widgets/editors";
import type { WidgetTypeKey } from "@/widgets/meta";
import { updateWidgetAction } from "@/app/admin/widgets/actions";

export default function WidgetEditorScreen({
  id,
  type,
  name: initialName,
  config: initialConfig,
}: {
  id: string;
  type: WidgetTypeKey;
  name: string;
  config: Record<string, unknown>;
}) {
  const t = useTranslations("admin.widgets");
  const router = useRouter();

  const [name, setName] = useState(initialName);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [config, setConfig] = useState<any>(initialConfig);
  const [saving, setSaving] = useState(false);

  const Editor = WIDGET_EDITORS[type];

  const save = async () => {
    setSaving(true);
    const { ok } = await updateWidgetAction(id, name, config);
    setSaving(false);
    if (ok) {
      toast.success(t("saved"));
      router.refresh();
    } else {
      toast.error(t("error"));
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <Link href={`/admin/widgets/${type}`} className="mb-1 inline-flex items-center gap-1 text-sm text-ink/50 hover:text-brand">
            <ArrowRightIcon width={14} height={14} className="rotate-180" />
            {t(`types.${type}`)}
          </Link>
          <span className="ml-2 rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-semibold text-brand">
            {t(`types.${type}`)}
          </span>
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

      <div className="mb-6 max-w-sm">
        <label htmlFor="w-name" className="mb-1.5 block text-sm font-medium text-ink/70">{t("name")}</label>
        <input id="w-name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass()} />
      </div>

      <div className="rounded-2xl border border-ink/5 bg-white p-6 shadow-sm">
        <Editor config={config} onChange={setConfig} />
      </div>
    </div>
  );
}
