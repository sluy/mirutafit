import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { getPublishedArticle } from "@/lib/articles";
import { mediaUrl } from "@/components/admin/media/types";
import { ArrowRightIcon } from "@/components/icons";

/* eslint-disable @next/next/no-img-element */

type Params = Promise<{ date: string; slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const article = await getPublishedArticle(locale, slug);
  if (!article) return {};

  const images = article.coverImage ? [{ url: mediaUrl(article.coverImage) }] : undefined;
  return {
    title: article.title,
    description: article.description || undefined,
    openGraph: {
      title: article.title,
      description: article.description || undefined,
      type: "article",
      publishedTime: article.publishedAt,
      images,
    },
  };
}

export default async function ArticleDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const locale = await getLocale();
  const t = await getTranslations("articles");
  const article = await getPublishedArticle(locale, slug);
  if (!article) notFound();

  const date = new Date(article.publishedAt).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
      <Link
        href="/articles"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink/50 transition-colors hover:text-brand"
      >
        <ArrowRightIcon width={15} height={15} className="rotate-180" />
        {t("backToList")}
      </Link>

      <header className="mt-6">
        {article.categories.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {article.categories.map((c) => (
              <Link
                key={c.key}
                href={`/articles?category=${c.key}`}
                className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand hover:bg-brand/20"
              >
                {c.label}
              </Link>
            ))}
          </div>
        )}
        <h1 className="font-display text-3xl font-extrabold leading-tight text-ink sm:text-4xl">
          {article.title}
        </h1>
        <p className="mt-3 text-sm text-ink/50">{date}</p>
        {article.description && (
          <p className="mt-4 text-lg leading-relaxed text-ink/70">{article.description}</p>
        )}
      </header>

      {article.coverImage && (
        <img
          src={mediaUrl(article.coverImage)}
          alt=""
          className="mt-8 aspect-[16/9] w-full rounded-3xl object-cover"
        />
      )}

      <div
        className="tiptap mt-10 text-[1.05rem] leading-relaxed"
        dangerouslySetInnerHTML={{ __html: article.body || "" }}
      />

      {article.tags.length > 0 && (
        <footer className="mt-12 flex flex-wrap gap-2 border-t border-ink/10 pt-6">
          {article.tags.map((tag) => (
            <Link
              key={tag.key}
              href={`/articles?tag=${tag.key}`}
              className="rounded-full bg-ink/5 px-3 py-1 text-xs font-medium text-ink/60 hover:bg-brand/10 hover:text-brand"
            >
              #{tag.label}
            </Link>
          ))}
        </footer>
      )}
    </article>
  );
}
