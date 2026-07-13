import { getTranslations } from "next-intl/server";
import { listArticles } from "@/lib/articles";
import { getViewCounts } from "@/lib/views";
import ArticlesList from "@/components/admin/content/ArticlesList";

export default async function ArticlesPage() {
  const t = await getTranslations("admin.articles");
  const articles = await listArticles();

  const counts = await getViewCounts(articles.map((a) => `article:${a.id}`));
  const views: Record<string, number> = {};
  for (const a of articles) views[a.id] = counts[`article:${a.id}`] ?? 0;

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl font-extrabold text-ink">{t("title")}</h1>
        <p className="mt-1 text-ink/60">{t("subtitle")}</p>
      </header>
      <ArticlesList articles={articles} views={views} />
    </div>
  );
}
