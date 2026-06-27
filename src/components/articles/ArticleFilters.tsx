"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { inputClass } from "@/components/ui/Field";

type Option = { key: string; label: string };

/** Search + category + tags + ordering, synced to the URL query string. */
export default function ArticleFilters({
  categories,
  tags,
}: {
  categories: Option[];
  tags: Option[];
}) {
  const t = useTranslations("articles");
  const router = useRouter();
  const params = useSearchParams();

  const [q, setQ] = useState(params.get("q") ?? "");
  const category = params.get("category") ?? "";
  const order = params.get("order") ?? "newest";
  const activeTags = (params.get("tag") ?? "").split(",").filter(Boolean);

  const apply = (patch: Record<string, string | string[] | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      const value = Array.isArray(v) ? v.join(",") : v;
      if (!value) next.delete(k);
      else next.set(k, value);
    }
    next.delete("page"); // any filter change resets pagination
    const qs = next.toString();
    router.push(qs ? `/articles?${qs}` : "/articles");
  };

  const toggleTag = (key: string) => {
    const next = activeTags.includes(key)
      ? activeTags.filter((k) => k !== key)
      : [...activeTags, key];
    apply({ tag: next });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <form
          className="flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            apply({ q });
          }}
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className={inputClass()}
          />
        </form>

        <select
          value={category}
          onChange={(e) => apply({ category: e.target.value })}
          className={`${inputClass()} sm:max-w-[14rem]`}
        >
          <option value="">{t("allCategories")}</option>
          {categories.map((c) => (
            <option key={c.key} value={c.key}>{c.label}</option>
          ))}
        </select>

        <select
          value={order}
          onChange={(e) => apply({ order: e.target.value })}
          className={`${inputClass()} sm:max-w-[12rem]`}
        >
          <option value="newest">{t("orderNewest")}</option>
          <option value="oldest">{t("orderOldest")}</option>
        </select>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => {
            const on = activeTags.includes(tag.key);
            return (
              <button
                key={tag.key}
                type="button"
                onClick={() => toggleTag(tag.key)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  on ? "bg-brand text-white" : "bg-ink/5 text-ink/60 hover:bg-brand/10 hover:text-brand"
                }`}
              >
                #{tag.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
