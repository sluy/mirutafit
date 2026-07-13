import { getTranslations } from "next-intl/server";
import { listStaticPages } from "@/lib/static-pages";
import { getViewCounts } from "@/lib/views";
import StaticPagesList from "@/components/admin/static-pages/StaticPagesList";

export default async function AdminStaticPagesPage() {
  const t = await getTranslations("admin.staticPages");
  const pages = await listStaticPages();

  const counts = await getViewCounts(pages.map((p) => `page:${p.slug}`));
  const views: Record<string, number> = {};
  for (const p of pages) views[p.id] = counts[`page:${p.slug}`] ?? 0;

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl font-extrabold text-ink">{t("title")}</h1>
        <p className="mt-1 text-ink/60">{t("subtitle")}</p>
      </header>
      <StaticPagesList pages={pages} views={views} />
    </div>
  );
}

