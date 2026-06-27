import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { listPublishedArticles } from "@/lib/articles";
import { listTaxonomies } from "@/lib/taxonomy";
import { taxonomyLabel } from "@/lib/taxonomy-shared";
import ArticleCard from "@/components/articles/ArticleCard";
import ArticleFilters from "@/components/articles/ArticleFilters";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("articles");
  return { title: t("title"), description: t("metaDescription") };
}

type SearchParams = {
  q?: string;
  category?: string;
  tag?: string;
  order?: string;
  page?: string;
};

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const locale = await getLocale();
  const t = await getTranslations("articles");

  const order = sp.order === "oldest" ? "oldest" : "newest";
  const page = Number(sp.page) || 1;

  const [result, categoryTerms, tagTerms] = await Promise.all([
    listPublishedArticles({
      locale,
      q: sp.q,
      category: sp.category,
      tags: sp.tag?.split(",").filter(Boolean),
      order,
      page,
    }),
    listTaxonomies("category"),
    listTaxonomies("tag"),
  ]);

  const categories = categoryTerms.map((c) => ({ key: c.key, label: taxonomyLabel(c, locale) }));
  const tags = tagTerms.map((t) => ({ key: t.key, label: taxonomyLabel(t, locale) }));

  // Preserve current filters when building pagination links.
  const pageHref = (p: number) => {
    const next = new URLSearchParams();
    if (sp.q) next.set("q", sp.q);
    if (sp.category) next.set("category", sp.category);
    if (sp.tag) next.set("tag", sp.tag);
    if (sp.order) next.set("order", sp.order);
    if (p > 1) next.set("page", String(p));
    const qs = next.toString();
    return qs ? `/articles?${qs}` : "/articles";
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
      <header className="mb-10 max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-brand">{t("eyebrow")}</p>
        <h1 className="mt-2 font-display text-4xl font-extrabold text-ink sm:text-5xl">{t("title")}</h1>
        <p className="mt-3 text-ink/60">{t("subtitle")}</p>
      </header>

      <div className="mb-10">
        <ArticleFilters categories={categories} tags={tags} />
      </div>

      {result.items.length === 0 ? (
        <p className="rounded-3xl border border-ink/5 bg-gray-50 p-16 text-center text-ink/40">
          {t("empty")}
        </p>
      ) : (
        <>
          <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {result.items.map((a) => (
              <ArticleCard key={a.id} article={a} locale={locale} readMore={t("readMore")} />
            ))}
          </div>

          {result.totalPages > 1 && (
            <nav className="mt-12 flex items-center justify-center gap-2">
              {Array.from({ length: result.totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={pageHref(p)}
                  className={`grid h-10 min-w-10 place-items-center rounded-full px-3 text-sm font-semibold transition-colors ${
                    p === result.page
                      ? "bg-brand text-white shadow-lg shadow-brand/30"
                      : "border border-ink/10 text-ink/60 hover:border-brand hover:text-brand"
                  }`}
                >
                  {p}
                </Link>
              ))}
            </nav>
          )}
        </>
      )}
    </div>
  );
}
