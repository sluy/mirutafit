"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { inputClass } from "@/components/ui/Field";
import { ArrowRightIcon, ExternalLinkIcon, UploadIcon } from "@/components/icons";
import { slugify, liveSlugify } from "@/lib/slug";
import type { StaticPageEditData } from "@/lib/static-pages-shared";
import { saveStaticPageAction } from "@/app/admin/static-pages/actions";

export default function StaticPageEditor({ page }: { page: StaticPageEditData }) {
  const t = useTranslations("admin.staticPages");
  const router = useRouter();

  const [data, setData] = useState<StaticPageEditData>(page);
  const [slugTouched, setSlugTouched] = useState(Boolean(page.slug));
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (patch: Partial<StaticPageEditData>) => setData((d) => ({ ...d, ...patch }));

  const onTitle = (value: string) => {
    const patch: Partial<StaticPageEditData> = { title: value };
    if (!slugTouched) patch.slug = slugify(value);
    set(patch);
  };

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    const text = await file.text();
    set({ html: text });
    toast.success(t("fileLoaded"));
  };

  const save = async () => {
    setSaving(true);
    const res = await saveStaticPageAction(data);
    setSaving(false);
    if (res.ok) {
      toast.success(t("saved"));
      router.refresh();
    } else if (res.error === "title") toast.error(t("errorTitle"));
    else if (res.error === "slug") toast.error(t("errorSlug"));
    else toast.error(t("error"));
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/static-pages" className="flex items-center gap-1.5 text-sm text-ink/50 hover:text-brand">
          <ArrowRightIcon width={15} height={15} className="rotate-180" />
          {t("backToList")}
        </Link>
        <div className="flex items-center gap-2">
          {data.published && (
            <a href={`/static/${data.slug}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-full border border-ink/10 px-4 py-2.5 text-sm font-medium text-ink/70 hover:border-brand hover:text-brand">
              <ExternalLinkIcon width={15} height={15} />
              {t("openPublic")}
            </a>
          )}
          <button type="button" onClick={save} disabled={saving} className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition-transform hover:scale-105 disabled:opacity-60">
            {saving ? "…" : t("save")}
          </button>
        </div>
      </div>

      {/* Metadata */}
      <div className="mb-6 space-y-4 rounded-2xl border border-ink/5 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/70">{t("fieldTitle")}</label>
            <input value={data.title} onChange={(e) => onTitle(e.target.value)} className={inputClass()} placeholder={t("titleHint")} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/70">{t("status")}</label>
            <div className="flex gap-1">
              <button type="button" onClick={() => set({ published: true })} className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${data.published ? "bg-brand text-white" : "bg-ink/5 text-ink/60 hover:bg-brand/10 hover:text-brand"}`}>
                {t("published")}
              </button>
              <button type="button" onClick={() => set({ published: false })} className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${!data.published ? "bg-brand text-white" : "bg-ink/5 text-ink/60 hover:bg-brand/10 hover:text-brand"}`}>
                {t("draft")}
              </button>
            </div>
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink/70">{t("fieldSlug")}</label>
          <input value={data.slug} onChange={(e) => { setSlugTouched(true); set({ slug: liveSlugify(e.target.value) }); }} className={`${inputClass()} font-mono`} />
          <p className="mt-1 text-xs text-ink/40">{typeof window !== "undefined" ? window.location.origin : ""}/static/{data.slug || "…"}</p>
        </div>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-ink/10 bg-ink/[0.02] p-4">
          <input
            type="checkbox"
            checked={data.respectMaintenance}
            onChange={(e) => set({ respectMaintenance: e.target.checked })}
            className="mt-0.5 h-4 w-4 rounded border-ink/20 text-brand focus:ring-brand"
          />
          <span>
            <span className="block text-sm font-medium text-ink/80">{t("respectMaintenance")}</span>
            <span className="mt-0.5 block text-xs text-ink/40">{t("respectMaintenanceHint")}</span>
          </span>
        </label>
      </div>

      {/* HTML */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-ink">{t("html")}</h2>
        <button type="button" onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 rounded-full border border-ink/10 bg-white px-4 py-2 text-xs font-semibold text-ink/70 shadow-sm transition-all hover:border-brand/30 hover:text-brand">
          <UploadIcon width={14} height={14} />
          {t("uploadFile")}
        </button>
        <input ref={fileRef} type="file" accept=".html,.htm,text/html" className="hidden" onChange={onPickFile} />
      </div>
      <p className="mb-3 text-xs text-ink/40">{t("htmlHint")}</p>
      <textarea
        value={data.html}
        onChange={(e) => set({ html: e.target.value })}
        spellCheck={false}
        rows={22}
        placeholder="<!DOCTYPE html>&#10;<html>&#10;  …&#10;</html>"
        className="w-full rounded-2xl border border-ink/10 bg-ink/[0.03] p-4 font-mono text-xs leading-relaxed text-ink shadow-inner outline-none focus:border-brand/40 focus:ring-2 focus:ring-brand/20"
      />
    </div>
  );
}
