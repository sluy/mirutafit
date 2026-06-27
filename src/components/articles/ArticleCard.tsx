import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";
import { mediaUrl } from "@/components/admin/media/types";
import type { ArticleCard as ArticleCardData } from "@/lib/articles";

/* eslint-disable @next/next/no-img-element */

/** Presentational card for an article (listing + widget grid). */
export default function ArticleCard({
  article,
  locale,
  readMore,
}: {
  article: ArticleCardData;
  locale: string;
  readMore: string;
}) {
  const date = new Date(article.publishedAt).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-ink/5 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
      <Link href={article.href} className="relative block aspect-[16/10] overflow-hidden bg-brand/5">
        {article.coverImage ? (
          <img
            src={mediaUrl(article.coverImage)}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-brand/20 to-brand/5" />
        )}
        {article.categories[0] && (
          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-ink backdrop-blur-sm">
            {article.categories[0].label}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <span className="text-xs text-ink/50">{date}</span>
        <h3 className="mt-2 font-display text-xl font-bold leading-snug text-ink transition-colors group-hover:text-brand">
          <Link href={article.href}>{article.title}</Link>
        </h3>
        {article.description && (
          <p className="mt-3 flex-1 text-sm leading-relaxed text-ink/60 line-clamp-3">
            {article.description}
          </p>
        )}
        <Link
          href={article.href}
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand"
        >
          {readMore}
          <ArrowRightIcon width={15} height={15} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}
