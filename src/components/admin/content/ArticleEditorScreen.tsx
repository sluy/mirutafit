"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import ArticleEditor from "@/components/admin/content/ArticleEditor";
import { inputClass } from "@/components/ui/Field";
import MediaPicker from "@/components/admin/media/MediaPicker";
import { mediaUrl } from "@/components/admin/media/types";
import { ArrowRightIcon, ImageIcon, TrashIcon } from "@/components/icons";
import { locales, localeNames, defaultLocale } from "@/i18n/config";
import { slugify } from "@/lib/slug";
import { taxonomyLabel, type TaxonomyTerm } from "@/lib/taxonomy-shared";
import type { ArticleEditData, ArticleTranslationInput } from "@/lib/articles";
import { saveArticleAction } from "@/app/admin/content/articles/actions";

/* eslint-disable @next/next/no-img-element */

type Translations = Record<string, ArticleTranslationInput>;

export default function ArticleEditorScreen({
  article,
  categories,
  tags,
}: {
  article: ArticleEditData;
  categories: TaxonomyTerm[];
  tags: TaxonomyTerm[];
}) {
  const t = useTranslations("admin.articles");
  const router = useRouter();

  const [tr, setTrState] = useState<Translations>(article.translations);
  const [coverImage, setCoverImage] = useState<string | null>(article.coverImage);
  const [status, setStatus] = useState(article.status);
  const [publishedAt, setPublishedAt] = useState(
    article.publishedAt ? article.publishedAt.slice(0, 10) : "",
  );
  const [taxIds, setTaxIds] = useState<string[]>(article.taxonomyIds);
  const [active, setActive] = useState(defaultLocale);
  const [slugTouched, setSlugTouched] = useState<Record<string, boolean>>({});
  const [coverOpen, setCoverOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const cur = tr[active];

  const setTr = (patch: Partial<ArticleTranslationInput>) =>
    setTrState((p) => ({ ...p, [active]: { ...p[active], ...patch } }));

  const onTitle = (value: string) => {
    const patch: Partial<ArticleTranslationInput> = { title: value };
    if (!slugTouched[active]) patch.slug = slugify(value);
    setTr(patch);
  };

  const toggleTax = (id: string) =>
    setTaxIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const save = async () => {
    setSaving(true);
    const res = await saveArticleAction({
      id: article.id,
      coverImage,
      status,
      publishedAt: publishedAt || null,
      taxonomyIds: taxIds,
      translations: tr,
    });
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
        <Link href="/admin/content/articles" className="flex items-center gap-1.5 text-sm text-ink/50 hover:text-brand">
          <ArrowRightIcon width={15} height={15} className="rotate-180" />
          {t("backToList")}
        </Link>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition-transform hover:scale-105 disabled:opacity-60"
        >
          {saving ? "…" : t("save")}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main */}
        <div className="space-y-4">
          {/* Language tabs */}
          <div className="flex gap-1 border-b border-ink/10">
            {locales.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setActive(l)}
                className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                  active === l ? "border-brand text-brand" : "border-transparent text-ink/50 hover:text-ink"
                }`}
              >
                {localeNames[l] ?? l}
                {l === defaultLocale && <span className="ml-1 text-[10px] text-ink/30">({t("default")})</span>}
              </button>
            ))}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/70">{t("fieldTitle")}</label>
            <input value={cur.title} onChange={(e) => onTitle(e.target.value)} className={inputClass()} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/70">{t("fieldSlug")}</label>
            <input
              value={cur.slug}
              onChange={(e) => {
                setSlugTouched((p) => ({ ...p, [active]: true }));
                setTr({ slug: slugify(e.target.value) });
              }}
              className={`${inputClass()} font-mono`}
            />
            <p className="mt-1 text-xs text-ink/40">/articles/&lt;YYYY-MM-DD&gt;/{cur.slug || "…"}</p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/70">{t("fieldDescription")}</label>
            <textarea value={cur.description} onChange={(e) => setTr({ description: e.target.value })} rows={2} className={`${inputClass()} resize-none`} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/70">{t("fieldBody")}</label>
            {/* key forces a remount when switching language tabs */}
            <ArticleEditor key={active} value={cur.body} onChange={(html) => setTr({ body: html })} />
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          <Panel title={t("status")}>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass()}>
              <option value="draft">{t("draft")}</option>
              <option value="published">{t("published")}</option>
            </select>
            <label className="mt-3 block text-xs font-medium text-ink/50">{t("publishDate")}</label>
            <input type="date" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} className={inputClass()} />
          </Panel>

          <Panel title={t("cover")}>
            {coverImage ? (
              <div className="space-y-2">
                <img src={mediaUrl(coverImage, { thumb: true })} alt="" className="aspect-video w-full rounded-lg object-cover" />
                <div className="flex gap-2">
                  <button type="button" onClick={() => setCoverOpen(true)} className="flex-1 rounded-lg border border-ink/10 py-1.5 text-xs font-medium text-ink/60 hover:border-brand hover:text-brand">
                    {t("changeCover")}
                  </button>
                  <button type="button" onClick={() => setCoverImage(null)} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
                    <TrashIcon width={14} height={14} />
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => setCoverOpen(true)} className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-ink/15 text-ink/40 hover:border-brand hover:text-brand">
                <ImageIcon width={24} height={24} />
                <span className="text-xs font-medium">{t("pickCover")}</span>
              </button>
            )}
          </Panel>

          <Panel title={t("categories")}>
            <TaxonomyChips terms={categories} selected={taxIds} onToggle={toggleTax} emptyLabel={t("noCategories")} />
          </Panel>
          <Panel title={t("tags")}>
            <TaxonomyChips terms={tags} selected={taxIds} onToggle={toggleTax} emptyLabel={t("noTags")} />
          </Panel>
        </aside>
      </div>

      <MediaPicker
        open={coverOpen}
        accept="image"
        onClose={() => setCoverOpen(false)}
        onSelect={(file) => setCoverImage(file.fileName)}
      />
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-ink/5 bg-white p-4 shadow-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink/40">{title}</p>
      {children}
    </div>
  );
}

function TaxonomyChips({
  terms,
  selected,
  onToggle,
  emptyLabel,
}: {
  terms: TaxonomyTerm[];
  selected: string[];
  onToggle: (id: string) => void;
  emptyLabel: string;
}) {
  if (terms.length === 0) return <p className="text-xs text-ink/40">{emptyLabel}</p>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {terms.map((term) => {
        const on = selected.includes(term.id);
        return (
          <button
            key={term.id}
            type="button"
            onClick={() => onToggle(term.id)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              on ? "bg-brand text-white" : "bg-ink/5 text-ink/60 hover:bg-brand/10 hover:text-brand"
            }`}
          >
            {taxonomyLabel(term, defaultLocale)}
          </button>
        );
      })}
    </div>
  );
}
