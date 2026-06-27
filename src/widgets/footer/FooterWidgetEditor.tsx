"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { inputClass } from "@/components/ui/Field";
import { TrashIcon, ArrowRightIcon } from "@/components/icons";
import { listWidgetOptionsAction } from "@/app/admin/widgets/actions";
import { useLocalized } from "../LocaleContext";
import type {
  FooterConfig,
  FooterColumn,
  FooterLink,
  WidgetEditorProps,
} from "../types";

const uid = () => crypto.randomUUID();

export default function FooterWidgetEditor({ config, onChange }: WidgetEditorProps<FooterConfig>) {
  const t = useTranslations("admin.widgets.footer");
  const lt = useLocalized();
  const set = (patch: Partial<FooterConfig>) => onChange({ ...config, ...patch });

  const [widgets, setWidgets] = useState<{ id: string; name: string; type: string }[]>([]);
  useEffect(() => {
    listWidgetOptionsAction().then(setWidgets).catch(() => {});
  }, []);

  const columns = config.columns ?? [];
  const setColumns = (next: FooterColumn[]) => set({ columns: next });
  const setColumn = (id: string, patch: Partial<FooterColumn>) =>
    setColumns(columns.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const addColumn = () =>
    setColumns([...columns, { id: uid(), title: "", links: [] }]);
  const removeColumn = (id: string) => setColumns(columns.filter((c) => c.id !== id));

  const setLink = (colId: string, linkId: string, patch: Partial<FooterLink>) =>
    setColumn(colId, { links: columns.find((c) => c.id === colId)!.links.map((l) => (l.id === linkId ? { ...l, ...patch } : l)) });
  const addLink = (colId: string) => {
    const col = columns.find((c) => c.id === colId)!;
    setColumn(colId, { links: [...col.links, { id: uid(), type: "link", label: "", url: "", widgetId: "" }] });
  };
  const removeLink = (colId: string, linkId: string) => {
    const col = columns.find((c) => c.id === colId)!;
    setColumn(colId, { links: col.links.filter((l) => l.id !== linkId) });
  };
  const moveLink = (colId: string, index: number, dir: -1 | 1) => {
    const col = columns.find((c) => c.id === colId)!;
    const next = [...col.links];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    setColumn(colId, { links: next });
  };

  return (
    <div className="space-y-6">
      {/* Tagline + toggles */}
      <Labeled label={t("tagline")}>
        <input value={lt.g(config.tagline)} onChange={(e) => set({ tagline: lt.s(config.tagline, e.target.value) })} placeholder={t("taglinePlaceholder")} className={inputClass()} />
      </Labeled>
      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm text-ink/80">
          <input type="checkbox" checked={config.showSocial} onChange={(e) => set({ showSocial: e.target.checked })} className="h-4 w-4 rounded border-ink/20 text-brand focus:ring-brand" />
          {t("showSocial")}
        </label>
        <label className="flex items-center gap-2 text-sm text-ink/80">
          <input type="checkbox" checked={config.showNewsletter} onChange={(e) => set({ showNewsletter: e.target.checked })} className="h-4 w-4 rounded border-ink/20 text-brand focus:ring-brand" />
          {t("showNewsletter")}
        </label>
      </div>

      {config.showNewsletter && (
        <div className="grid gap-4 rounded-xl border border-ink/10 bg-gray-50 p-4 sm:grid-cols-2">
          <Labeled label={t("newsletterTitle")}>
            <input value={lt.g(config.newsletterTitle)} onChange={(e) => set({ newsletterTitle: lt.s(config.newsletterTitle, e.target.value) })} className={inputClass()} />
          </Labeled>
          <Labeled label={t("newsletterText")}>
            <input value={lt.g(config.newsletterText)} onChange={(e) => set({ newsletterText: lt.s(config.newsletterText, e.target.value) })} className={inputClass()} />
          </Labeled>
        </div>
      )}

      {/* Columns */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink/40">{t("columns")}</span>
          <button type="button" onClick={addColumn} className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand hover:bg-brand/20">+ {t("addColumn")}</button>
        </div>
        {columns.length === 0 ? (
          <p className="rounded-xl border border-dashed border-ink/15 p-4 text-center text-xs text-ink/40">{t("noColumns")}</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {columns.map((col) => (
              <div key={col.id} className="rounded-xl border border-ink/10 bg-gray-50/60 p-3">
                <div className="mb-2 flex items-center gap-2">
                  <input value={lt.g(col.title)} onChange={(e) => setColumn(col.id, { title: lt.s(col.title, e.target.value) })} placeholder={t("columnTitle")} className={`${inputClass()} flex-1 py-1.5 text-sm font-semibold`} />
                  <button type="button" onClick={() => removeColumn(col.id)} className="shrink-0 rounded-lg p-1.5 text-ink/30 hover:bg-red-50 hover:text-red-600" title={t("removeColumn")}>
                    <TrashIcon width={14} height={14} />
                  </button>
                </div>
                <div className="space-y-2">
                  {col.links.map((l, i) => (
                    <div key={l.id} className="rounded-lg border border-ink/10 bg-white p-2">
                      <div className="mb-1.5 flex items-center gap-1.5">
                        <div className="flex overflow-hidden rounded-md border border-ink/10 text-[10px]">
                          <button type="button" onClick={() => setLink(col.id, l.id, { type: "link" })} className={`px-2 py-0.5 ${l.type === "link" ? "bg-brand text-white" : "text-ink/50"}`}>{t("linkType_link")}</button>
                          <button type="button" onClick={() => setLink(col.id, l.id, { type: "widget" })} className={`px-2 py-0.5 ${l.type === "widget" ? "bg-brand text-white" : "text-ink/50"}`}>{t("linkType_widget")}</button>
                        </div>
                        <input value={lt.g(l.label)} onChange={(e) => setLink(col.id, l.id, { label: lt.s(l.label, e.target.value) })} placeholder={t("linkLabel")} className={`${inputClass()} flex-1 py-1 text-xs`} />
                        <div className="flex shrink-0 flex-col">
                          <button type="button" onClick={() => moveLink(col.id, i, -1)} disabled={i === 0} className="px-1 text-ink/40 hover:text-brand disabled:opacity-30"><ArrowRightIcon width={12} height={12} className="-rotate-90" /></button>
                          <button type="button" onClick={() => moveLink(col.id, i, 1)} disabled={i === col.links.length - 1} className="px-1 text-ink/40 hover:text-brand disabled:opacity-30"><ArrowRightIcon width={12} height={12} className="rotate-90" /></button>
                        </div>
                        <button type="button" onClick={() => removeLink(col.id, l.id)} className="shrink-0 text-ink/30 hover:text-red-600"><TrashIcon width={13} height={13} /></button>
                      </div>
                      {l.type === "link" ? (
                        <input value={l.url} onChange={(e) => setLink(col.id, l.id, { url: e.target.value })} placeholder={t("linkUrl")} className={`${inputClass()} py-1 text-xs font-mono`} />
                      ) : widgets.length === 0 ? (
                        <p className="text-[11px] text-ink/40">{t("noWidgets")}</p>
                      ) : (
                        <select value={l.widgetId} onChange={(e) => setLink(col.id, l.id, { widgetId: e.target.value })} className={`${inputClass()} py-1 text-xs`}>
                          <option value="">{t("pickWidget")}</option>
                          {widgets.map((w) => (<option key={w.id} value={w.id}>{w.name}</option>))}
                        </select>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => addLink(col.id)} className="w-full rounded-lg border border-dashed border-ink/15 py-1.5 text-xs font-medium text-ink/50 hover:border-brand hover:text-brand">+ {t("addLink")}</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legal line */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Labeled label={t("copyright")}>
          <input value={lt.g(config.copyright)} onChange={(e) => set({ copyright: lt.s(config.copyright, e.target.value) })} className={inputClass()} />
        </Labeled>
        <Labeled label={t("madeWith")}>
          <input value={lt.g(config.madeWith)} onChange={(e) => set({ madeWith: lt.s(config.madeWith, e.target.value) })} placeholder={t("madeWithPlaceholder")} className={inputClass()} />
        </Labeled>
      </div>
    </div>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink/40">{label}</span>
      {children}
    </div>
  );
}
