"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import Dialog from "@/components/ui/Dialog";
import { inputClass } from "@/components/ui/Field";
import { TrashIcon } from "@/components/icons";
import type { WidgetTypeKey } from "@/widgets/meta";
import { createWidgetAction, deleteWidgetAction } from "@/app/admin/widgets/actions";

type Row = { id: string; name: string; updatedAt: string };

export default function WidgetTypeList({
  type,
  widgets,
}: {
  type: WidgetTypeKey;
  widgets: Row[];
}) {
  const t = useTranslations("admin.widgets");
  const router = useRouter();

  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const create = async () => {
    setBusy(true);
    const { ok, id } = await createWidgetAction(type, name);
    setBusy(false);
    if (ok && id) {
      setCreateOpen(false);
      setName("");
      router.push(`/admin/widgets/${type}/${id}`);
    } else {
      toast.error(t("error"));
    }
  };

  const remove = async (id: string) => {
    if (!confirm(t("confirmDelete"))) return;
    const { ok } = await deleteWidgetAction(id);
    if (ok) {
      toast.success(t("deleted"));
      router.refresh();
    } else {
      toast.error(t("error"));
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-ink">{t(`types.${type}`)}</h1>
          <p className="mt-1 text-ink/60">{t("subtitle")}</p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition-transform hover:scale-105"
        >
          + {t("new")}
        </button>
      </div>

      {widgets.length === 0 ? (
        <p className="rounded-2xl border border-ink/5 bg-white p-10 text-center text-sm text-ink/40 shadow-sm">
          {t("empty")}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {widgets.map((w) => (
            <div key={w.id} className="group relative rounded-2xl border border-ink/5 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
              <Link href={`/admin/widgets/${type}/${w.id}`} className="block">
                <p className="font-display font-bold text-ink">{w.name}</p>
                <p className="mt-1 text-xs text-ink/40">{new Date(w.updatedAt).toLocaleString()}</p>
              </Link>
              <button
                type="button"
                onClick={() => remove(w.id)}
                className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg text-ink/30 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
              >
                <TrashIcon width={16} height={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} title={`${t("new")} · ${t(`types.${type}`)}`} onSubmit={create}>
        <div className="space-y-4">
          <div>
            <label htmlFor="widget-name" className="mb-1.5 block text-sm font-medium text-ink/70">{t("name")}</label>
            <input
              id="widget-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("namePlaceholder")}
              className={inputClass()}
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setCreateOpen(false)} className="rounded-full px-5 py-2.5 text-sm font-medium text-ink/60 hover:bg-ink/5">
              {t("cancel")}
            </button>
            <button type="button" onClick={create} disabled={busy} className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
              {busy ? "…" : t("create")}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
