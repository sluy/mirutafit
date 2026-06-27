import { randomUUID } from "node:crypto";
import { prisma } from "./prisma";
import { locales, defaultLocale } from "@/i18n/config";
import { slugify } from "./slug";
import { Prisma } from "@/generated/prisma/client";

export type ArticleTranslationInput = {
  title: string;
  slug: string;
  description: string;
  body: string;
};

export type ArticleEditData = {
  id: string;
  coverImage: string | null;
  status: string;
  publishedAt: string | null; // ISO
  taxonomyIds: string[];
  translations: Record<string, ArticleTranslationInput>;
};

export type ArticleListItem = {
  id: string;
  title: string; // default-locale (or first) title
  status: string;
  publishedAt: string | null;
  categoryKeys: string[];
};

/** Admin list view. */
export async function listArticles(): Promise<ArticleListItem[]> {
  const rows = await prisma.article.findMany({
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    include: { translations: true, taxonomies: true },
  });
  return rows.map((a) => {
    const tr =
      a.translations.find((t) => t.locale === defaultLocale) ?? a.translations[0];
    return {
      id: a.id,
      title: tr?.title || "—",
      status: a.status,
      publishedAt: a.publishedAt?.toISOString() ?? null,
      categoryKeys: a.taxonomies.filter((t) => t.kind === "category").map((t) => t.key),
    };
  });
}

/** Full data for the editor. */
export async function getArticleForEdit(id: string): Promise<ArticleEditData | null> {
  const a = await prisma.article.findUnique({
    where: { id },
    include: { translations: true, taxonomies: true },
  });
  if (!a) return null;

  const translations: Record<string, ArticleTranslationInput> = {};
  for (const locale of locales) {
    const tr = a.translations.find((t) => t.locale === locale);
    translations[locale] = {
      title: tr?.title ?? "",
      slug: tr?.slug ?? "",
      description: tr?.description ?? "",
      body: tr?.body ?? "",
    };
  }

  return {
    id: a.id,
    coverImage: a.coverImage,
    status: a.status,
    publishedAt: a.publishedAt?.toISOString() ?? null,
    taxonomyIds: a.taxonomies.map((t) => t.id),
    translations,
  };
}

/** Create an empty draft and return its id. */
export async function createArticle(): Promise<string> {
  const a = await prisma.article.create({
    data: {
      status: "draft",
      translations: {
        create: {
          locale: defaultLocale,
          title: "Untitled",
          slug: `untitled-${randomUUID().slice(0, 8)}`,
        },
      },
    },
  });
  return a.id;
}

export async function saveArticle(
  input: ArticleEditData,
): Promise<{ ok: boolean; error?: "slug" | "generic" | "title" }> {
  // The default locale must have a title.
  if (!input.translations[defaultLocale]?.title.trim()) {
    return { ok: false, error: "title" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.article.update({
        where: { id: input.id },
        data: {
          coverImage: input.coverImage || null,
          status: input.status,
          publishedAt: input.publishedAt ? new Date(input.publishedAt) : null,
          taxonomies: { set: input.taxonomyIds.map((id) => ({ id })) },
        },
      });

      for (const locale of locales) {
        const tr = input.translations[locale];
        if (tr && tr.title.trim()) {
          const slug = (tr.slug.trim() || slugify(tr.title)).slice(0, 80);
          await tx.articleTranslation.upsert({
            where: { articleId_locale: { articleId: input.id, locale } },
            create: {
              articleId: input.id,
              locale,
              title: tr.title.trim(),
              slug,
              description: tr.description,
              body: tr.body,
            },
            update: {
              title: tr.title.trim(),
              slug,
              description: tr.description,
              body: tr.body,
            },
          });
        } else {
          await tx.articleTranslation.deleteMany({
            where: { articleId: input.id, locale },
          });
        }
      }
    });
    return { ok: true };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, error: "slug" };
    }
    return { ok: false, error: "generic" };
  }
}

export async function deleteArticle(id: string): Promise<void> {
  await prisma.article.delete({ where: { id } });
}

// ── Public (read) side ────────────────────────────────────────────

export type ArticleTaxonomyRef = { key: string; label: string };

export type ArticleCard = {
  id: string;
  title: string;
  description: string;
  slug: string;
  coverImage: string | null;
  publishedAt: string; // ISO
  href: string;
  categories: ArticleTaxonomyRef[];
};

export type ArticleDetail = ArticleCard & {
  body: string;
  tags: ArticleTaxonomyRef[];
};

/** YYYY-MM-DD segment used in public article URLs. */
export function articleDateSegment(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

/** Canonical public URL for an article (date + locale slug). */
export function articleHref(publishedAt: string, slug: string): string {
  return `/articles/${articleDateSegment(publishedAt)}/${slug}`;
}

type TrRow = { locale: string; title: string; slug: string; description: string; body: string };
type TaxRow = { key: string; kind: string; translations: { locale: string; label: string }[] };

function resolveTr<T extends { locale: string }>(rows: T[], locale: string): T | null {
  return (
    rows.find((r) => r.locale === locale) ??
    rows.find((r) => r.locale === defaultLocale) ??
    rows[0] ??
    null
  );
}

function taxLabel(tax: TaxRow, locale: string): string {
  return (
    tax.translations.find((t) => t.locale === locale)?.label ||
    tax.translations.find((t) => t.locale === defaultLocale)?.label ||
    tax.key
  );
}

function taxRefs(taxonomies: TaxRow[], kind: string, locale: string): ArticleTaxonomyRef[] {
  return taxonomies
    .filter((t) => t.kind === kind)
    .map((t) => ({ key: t.key, label: taxLabel(t, locale) }));
}

/** Only published articles whose publish date is in the past (free scheduling). */
function publishedWhere() {
  return { status: "published", publishedAt: { not: null, lte: new Date() } } as const;
}

export type ListPublishedOpts = {
  locale: string;
  q?: string;
  category?: string; // category key
  tags?: string[]; // tag keys — matches any (OR)
  order?: "newest" | "oldest";
  page?: number;
  pageSize?: number;
};

export type PublishedPage = {
  items: ArticleCard[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function listPublishedArticles(opts: ListPublishedOpts): Promise<PublishedPage> {
  const { locale, q, category, tags, order = "newest" } = opts;
  const pageSize = opts.pageSize ?? 9;
  const page = Math.max(1, opts.page ?? 1);

  const rows = await prisma.article.findMany({
    where: publishedWhere(),
    orderBy: { publishedAt: order === "oldest" ? "asc" : "desc" },
    include: { translations: true, taxonomies: { include: { translations: true } } },
  });

  const needle = q?.trim().toLowerCase();
  const tagSet = (tags ?? []).filter(Boolean);

  const all: ArticleCard[] = [];
  for (const a of rows) {
    const tr = resolveTr(a.translations as TrRow[], locale);
    if (!tr || !tr.title) continue;
    const taxes = a.taxonomies as unknown as TaxRow[];
    const keys = new Set(taxes.map((t) => t.key));

    if (category && !keys.has(category)) continue;
    if (tagSet.length && !tagSet.some((t) => keys.has(t))) continue;
    if (needle) {
      const hay = `${tr.title} ${tr.description}`.toLowerCase();
      if (!hay.includes(needle)) continue;
    }

    const publishedAt = a.publishedAt!.toISOString();
    all.push({
      id: a.id,
      title: tr.title,
      description: tr.description,
      slug: tr.slug,
      coverImage: a.coverImage,
      publishedAt,
      href: articleHref(publishedAt, tr.slug),
      categories: taxRefs(taxes, "category", locale),
    });
  }

  const total = all.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  return { items: all.slice(start, start + pageSize), total, page, pageSize, totalPages };
}

/** Resolve a single published article for the detail page (slug per locale). */
export async function getPublishedArticle(
  locale: string,
  slug: string,
): Promise<ArticleDetail | null> {
  const trMatch = await prisma.articleTranslation.findFirst({
    where: { slug, article: publishedWhere() },
    include: {
      article: {
        include: { translations: true, taxonomies: { include: { translations: true } } },
      },
    },
  });
  if (!trMatch) return null;

  const a = trMatch.article;
  const tr = resolveTr(a.translations as TrRow[], locale) ?? (trMatch as unknown as TrRow);
  const taxes = a.taxonomies as unknown as TaxRow[];
  const publishedAt = a.publishedAt!.toISOString();

  return {
    id: a.id,
    title: tr.title,
    description: tr.description,
    slug: tr.slug,
    coverImage: a.coverImage,
    publishedAt,
    href: articleHref(publishedAt, tr.slug),
    body: tr.body,
    categories: taxRefs(taxes, "category", locale),
    tags: taxRefs(taxes, "tag", locale),
  };
}

/** Published articles for an explicit, ordered list of ids (widget manual mode). */
export async function getPublishedArticlesByIds(
  locale: string,
  ids: string[],
): Promise<ArticleCard[]> {
  if (ids.length === 0) return [];
  const rows = await prisma.article.findMany({
    where: { id: { in: ids }, ...publishedWhere() },
    include: { translations: true, taxonomies: { include: { translations: true } } },
  });
  const byId = new Map(rows.map((a) => [a.id, a]));
  const cards: ArticleCard[] = [];
  for (const id of ids) {
    const a = byId.get(id);
    if (!a) continue;
    const tr = resolveTr(a.translations as TrRow[], locale);
    if (!tr || !tr.title) continue;
    const publishedAt = a.publishedAt!.toISOString();
    cards.push({
      id: a.id,
      title: tr.title,
      description: tr.description,
      slug: tr.slug,
      coverImage: a.coverImage,
      publishedAt,
      href: articleHref(publishedAt, tr.slug),
      categories: taxRefs(a.taxonomies as unknown as TaxRow[], "category", locale),
    });
  }
  return cards;
}

/** Lightweight options for pickers (widget manual mode). */
export async function listArticleOptions(
  locale: string,
): Promise<{ id: string; title: string; status: string }[]> {
  const rows = await prisma.article.findMany({
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    include: { translations: true },
  });
  return rows.map((a) => {
    const tr = resolveTr(a.translations as TrRow[], locale);
    return { id: a.id, title: tr?.title || "—", status: a.status };
  });
}
