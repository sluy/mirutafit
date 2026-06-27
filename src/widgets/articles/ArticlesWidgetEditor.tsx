"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { inputClass } from "@/components/ui/Field";
import {
  listArticleOptionsAction,
  listTaxonomyOptionsAction,
  type Option,
} from "@/app/admin/content/actions";
import { useLocalized } from "../LocaleContext";
import type { ArticlesConfig, ArticlesWidgetMode, WidgetEditorProps } from "../types";

type ArticleOption = { id: string; title: string; status: string };

const MODES: ArticlesWidgetMode[] = ["latest", "first", "manual"];

export default function ArticlesWidgetEditor({
  config,
  onChange,
}: WidgetEditorProps<ArticlesConfig>) {
  const t = useTranslations("admin.widgets.articles");
  const lt = useLocalized();
  const set = (patch: Partial<ArticlesConfig>) => onChange({ ...config, ...patch });

  const [articles, setArticles] = useState<ArticleOption[]>([]);
  const [categories, setCategories] = useState<Option[]>([]);

  useEffect(() => {
    listArticleOptionsAction().then(setArticles).catch(() => {});
    listTaxonomyOptionsAction("category").then(setCategories).catch(() => {});
  }, []);

  const toggleArticle = (id: string) => {
    const ids = config.articleIds ?? [];
    set({ articleIds: ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id] });
  };

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/40">{t("heading")}</label>
        <input
          value={lt.g(config.heading)}
          onChange={(e) => set({ heading: lt.s(config.heading, e.target.value) })}
          placeholder={t("headingPlaceholder")}
          className={inputClass()}
        />
      </div>

      {/* Mode */}
      <div>
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/40">{t("mode")}</span>
        <div className="flex flex-wrap gap-2">
          {MODES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => set({ mode: m })}
              className={`rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                config.mode === m ? "border-brand bg-brand/10 text-brand" : "border-ink/10 text-ink/60 hover:border-brand/40"
              }`}
            >
              {t(`mode_${m}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Latest/first options */}
      {config.mode !== "manual" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/40">{t("count")}</label>
            <input
              type="number"
              min={1}
              max={12}
              value={config.count}
              onChange={(e) => set({ count: Math.max(1, Number(e.target.value) || 1) })}
              className={inputClass()}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/40">{t("category")}</label>
            <select
              value={config.categoryKey ?? ""}
              onChange={(e) => set({ categoryKey: e.target.value || null })}
              className={inputClass()}
            >
              <option value="">{t("anyCategory")}</option>
              {categories.map((c) => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Manual picker */}
      {config.mode === "manual" && (
        <div>
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/40">{t("pickArticles")}</span>
          {articles.length === 0 ? (
            <p className="text-xs text-ink/40">{t("noArticles")}</p>
          ) : (
            <div className="max-h-64 space-y-1 overflow-y-auto rounded-xl border border-ink/10 p-2">
              {articles.map((a) => {
                const idx = (config.articleIds ?? []).indexOf(a.id);
                const on = idx >= 0;
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => toggleArticle(a.id)}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      on ? "bg-brand/10 text-brand" : "text-ink/70 hover:bg-ink/5"
                    }`}
                  >
                    <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-bold ${on ? "bg-brand text-white" : "bg-ink/10 text-ink/40"}`}>
                      {on ? idx + 1 : ""}
                    </span>
                    <span className="flex-1 truncate">{a.title}</span>
                    {a.status !== "published" && (
                      <span className="rounded-full bg-ink/5 px-2 py-0.5 text-[10px] text-ink/40">{t("draftTag")}</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
          <p className="mt-1 text-xs text-ink/40">{t("manualHint")}</p>
        </div>
      )}

      {/* Columns */}
      <div>
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/40">{t("columns")}</span>
        <div className="flex gap-2">
          {[2, 3, 4].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => set({ columns: c })}
              className={`h-10 w-12 rounded-xl border text-sm font-semibold transition-colors ${
                config.columns === c ? "border-brand bg-brand/10 text-brand" : "border-ink/10 text-ink/60 hover:border-brand/40"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* View all */}
      <label className="flex items-center gap-2 text-sm text-ink/80">
        <input
          type="checkbox"
          checked={config.showViewAll}
          onChange={(e) => set({ showViewAll: e.target.checked })}
          className="h-4 w-4 rounded border-ink/20 text-brand focus:ring-brand"
        />
        {t("showViewAll")}
      </label>
    </div>
  );
}
