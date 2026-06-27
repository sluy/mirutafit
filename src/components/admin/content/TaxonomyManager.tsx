"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import Dialog from "@/components/ui/Dialog";
import { inputClass } from "@/components/ui/Field";
import { TrashIcon } from "@/components/icons";
import { locales, localeNames, defaultLocale } from "@/i18n/config";
import { slugifyKey, type TaxonomyKind, type TaxonomyTerm } from "@/lib/taxonomy-shared";
import {
  createTaxonomyAction,
  updateTaxonomyAction,
  deleteTaxonomyAction,
} from "@/app/admin/content/actions";

export default function TaxonomyManager({
  kind,
  terms,
}: {
  kind: TaxonomyKind;
  terms: TaxonomyTerm[];
}) {
  const t = useTranslations("admin.taxonomy");
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition-transform hover:scale-105"
        >
          + {t("new")}
        </button>
      </div>

      {terms.length === 0 ? (
        <p className="rounded-2xl border border-ink/5 bg-white p-10 text-center text-sm text-ink/40 shadow-sm">
          {t("empty")}
        </p>
      ) : (
        <div className="space-y-3">
          {terms.map((term) => (
            <TermRow key={term.id} kind={kind} term={term} onChanged={() => router.refresh()} />
          ))}
        </div>
      )}

      <CreateDialog
        kind={kind}
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => router.refresh()}
      />
    </div>
  );
}

function TermRow({
  kind,
  term,
  onChanged,
}: {
  kind: TaxonomyKind;
  term: TaxonomyTerm;
  onChanged: () => void;
}) {
  const t = useTranslations("admin.taxonomy");
  const [labels, setLabels] = useState<Record<string, string>>(
    Object.fromEntries(locales.map((l) => [l, term.labels[l] ?? ""])),
  );
  const [saving, setSaving] = useState(false);
  const dirty = locales.some((l) => (labels[l] ?? "") !== (term.labels[l] ?? ""));

  const save = async () => {
    setSaving(true);
    const { ok } = await updateTaxonomyAction(kind, term.id, labels);
    setSaving(false);
    if (ok) {
      toast.success(t("saved"));
      onChanged();
    } else toast.error(t("error"));
  };

  const remove = async () => {
    if (!confirm(t("confirmDelete"))) return;
    const { ok } = await deleteTaxonomyAction(kind, term.id);
    if (ok) {
      toast.success(t("deleted"));
      onChanged();
    } else toast.error(t("error"));
  };

  return (
    <div className="rounded-2xl border border-ink/5 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <code className="rounded bg-ink/5 px-2 py-0.5 font-mono text-xs text-ink/60">{term.key}</code>
        <div className="flex items-center gap-2">
          {dirty && (
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="rounded-full bg-brand px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
            >
              {saving ? "…" : t("save")}
            </button>
          )}
          <button
            type="button"
            onClick={remove}
            className="grid h-8 w-8 place-items-center rounded-lg text-ink/30 hover:bg-red-50 hover:text-red-600"
          >
            <TrashIcon width={16} height={16} />
          </button>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {locales.map((l) => (
          <label key={l} className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-ink/40">
              {localeNames[l] ?? l}
            </span>
            <input
              value={labels[l] ?? ""}
              onChange={(e) => setLabels((p) => ({ ...p, [l]: e.target.value }))}
              placeholder={t("label")}
              className={inputClass()}
            />
          </label>
        ))}
      </div>
    </div>
  );
}

function CreateDialog({
  kind,
  open,
  onClose,
  onCreated,
}: {
  kind: TaxonomyKind;
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const t = useTranslations("admin.taxonomy");
  const [labels, setLabels] = useState<Record<string, string>>({});
  const [key, setKey] = useState("");
  const [keyTouched, setKeyTouched] = useState(false);
  const [busy, setBusy] = useState(false);

  // Reset when (re)opened.
  const [lastOpen, setLastOpen] = useState(false);
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) {
      setLabels({});
      setKey("");
      setKeyTouched(false);
    }
  }

  const setLabel = (locale: string, value: string) => {
    setLabels((p) => ({ ...p, [locale]: value }));
    // Auto-derive the key from the default-locale label until edited manually.
    if (locale === defaultLocale && !keyTouched) setKey(slugifyKey(value));
  };

  const create = async () => {
    if (!key.trim()) return;
    setBusy(true);
    const { ok, error } = await createTaxonomyAction(kind, key, labels);
    setBusy(false);
    if (ok) {
      onClose();
      onCreated();
      toast.success(t("created"));
    } else {
      toast.error(error === "exists" ? t("errorExists") : t("error"));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title={t("new")}>
      <div className="space-y-4">
        {locales.map((l) => (
          <label key={l} className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink/70">
              {t("label")} · {localeNames[l] ?? l}
            </span>
            <input
              autoFocus={l === defaultLocale}
              value={labels[l] ?? ""}
              onChange={(e) => setLabel(l, e.target.value)}
              className={inputClass()}
            />
          </label>
        ))}
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink/70">{t("key")}</span>
          <input
            value={key}
            onChange={(e) => {
              setKeyTouched(true);
              setKey(slugifyKey(e.target.value));
            }}
            className={`${inputClass()} font-mono`}
          />
          <p className="mt-1 text-xs text-ink/40">{t("keyHint")}</p>
        </label>
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="rounded-full px-5 py-2.5 text-sm font-medium text-ink/60 hover:bg-ink/5">
            {t("cancel")}
          </button>
          <button type="button" onClick={create} disabled={busy || !key.trim()} className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
            {busy ? "…" : t("create")}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
