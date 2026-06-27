import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import {
  listPublishedArticles,
  getPublishedArticlesByIds,
  type ArticleCard as ArticleCardData,
} from "@/lib/articles";
import ArticleCard from "@/components/articles/ArticleCard";
import { ArrowRightIcon } from "@/components/icons";
import { resolveText } from "../i18n";
import type { ArticlesConfig } from "../types";

// Static grid-column classes so Tailwind keeps them.
const COLS: Record<number, string> = {
  1: "lg:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-2 lg:grid-cols-3",
  4: "md:grid-cols-2 lg:grid-cols-4",
};

/** Frontend render for the Articles widget. Server component (queries DB). */
export default async function ArticlesWidget({ config }: { config: ArticlesConfig }) {
  const locale = await getLocale();
  const t = await getTranslations("widgets.articles");

  let items: ArticleCardData[] = [];
  if (config.mode === "manual") {
    items = await getPublishedArticlesByIds(locale, config.articleIds ?? []);
  } else {
    const res = await listPublishedArticles({
      locale,
      category: config.categoryKey ?? undefined,
      order: config.mode === "first" ? "oldest" : "newest",
      pageSize: Math.max(1, config.count ?? 3),
      page: 1,
    });
    items = res.items;
  }

  if (items.length === 0) return null;

  const heading = resolveText(config.heading, locale).trim() || t("defaultHeading");
  const subtitle =
    config.mode === "first" ? t("subFirst") : config.mode === "manual" ? t("subManual") : t("subLatest");

  return (
    <section className="bg-gray-50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-end justify-between gap-4 sm:flex-row">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand">{subtitle}</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-ink sm:text-4xl">{heading}</h2>
          </div>
          {config.showViewAll && (
            <Link
              href="/articles"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-dark"
            >
              {t("viewAll")}
              <ArrowRightIcon className="transition-transform group-hover:translate-x-1" width={16} height={16} />
            </Link>
          )}
        </div>

        <div className={`mt-12 grid gap-7 ${COLS[config.columns] ?? COLS[3]}`}>
          {items.map((a) => (
            <ArticleCard key={a.id} article={a} locale={locale} readMore={t("readMore")} />
          ))}
        </div>
      </div>
    </section>
  );
}
