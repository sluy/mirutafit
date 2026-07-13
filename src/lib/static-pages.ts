import { prisma } from "./prisma";
import { slugify } from "./slug";
import type {
  StaticPageListItem,
  StaticPageEditData,
} from "./static-pages-shared";
import { Prisma } from "@/generated/prisma/client";

// Re-export the client-safe types so callers can import from one place.
export type { StaticPageListItem, StaticPageEditData } from "./static-pages-shared";

// ── Admin ─────────────────────────────────────────────────────

export async function listStaticPages(): Promise<StaticPageListItem[]> {
  const rows = await prisma.staticPage.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return rows.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    published: p.published,
    updatedAt: p.updatedAt.toISOString(),
  }));
}

export async function getStaticPageForEdit(
  id: string,
): Promise<StaticPageEditData | null> {
  const p = await prisma.staticPage.findUnique({ where: { id } });
  if (!p) return null;
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    html: p.html,
    published: p.published,
    respectMaintenance: p.respectMaintenance,
    notifyViews: p.notifyViews,
  };
}

export async function createStaticPage(): Promise<string> {
  const p = await prisma.staticPage.create({
    data: {
      title: "Nueva página",
      slug: `pagina-${randomSuffix()}`,
      published: false,
    },
  });
  return p.id;
}

export async function saveStaticPage(
  input: StaticPageEditData,
): Promise<{ ok: boolean; error?: "slug" | "title" | "generic" }> {
  if (!input.title.trim()) return { ok: false, error: "title" };
  const slug = (input.slug.trim() ? slugify(input.slug) : slugify(input.title)).slice(0, 80);

  try {
    await prisma.staticPage.update({
      where: { id: input.id },
      data: {
        slug,
        title: input.title.trim(),
        html: input.html,
        published: input.published,
        respectMaintenance: input.respectMaintenance,
        notifyViews: input.notifyViews,
      },
    });
    return { ok: true };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, error: "slug" };
    }
    return { ok: false, error: "generic" };
  }
}

export async function deleteStaticPage(id: string): Promise<void> {
  await prisma.staticPage.delete({ where: { id } });
}

// ── Public ────────────────────────────────────────────────────

/** Published pages only. Returns the raw HTML to serve verbatim. */
export async function getPublishedStaticPage(
  slug: string,
): Promise<{ html: string; respectMaintenance: boolean } | null> {
  const p = await prisma.staticPage.findFirst({
    where: { slug, published: true },
    select: { html: true, respectMaintenance: true },
  });
  return p ? { html: p.html, respectMaintenance: p.respectMaintenance } : null;
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 10);
}
