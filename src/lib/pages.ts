import { prisma } from "./prisma";
import { emptyLayout, type PageLayout, type WidgetInstance } from "@/widgets/types";

/** Get (or lazily create) a page by slug. */
export async function getOrCreatePage(slug: string, title: string) {
  const existing = await prisma.page.findUnique({ where: { slug } });
  if (existing) return existing;
  return prisma.page.create({
    data: { slug, title, layout: emptyLayout },
  });
}

export function pageLayout(page: { layout: unknown }): PageLayout {
  const layout = page.layout as PageLayout | null;
  return layout && Array.isArray(layout.rows) ? layout : emptyLayout;
}

/** Load all widget instances referenced by a layout, keyed by id. */
export async function getLayoutWidgets(
  layout: PageLayout,
): Promise<Record<string, WidgetInstance>> {
  const ids = layout.rows.flatMap((r) => r.columns.flatMap((c) => c.widgetIds));
  if (ids.length === 0) return {};

  const widgets = await prisma.widget.findMany({ where: { id: { in: ids } } });
  const map: Record<string, WidgetInstance> = {};
  for (const w of widgets) {
    map[w.id] = {
      id: w.id,
      type: w.type,
      name: w.name,
      config: (w.config as Record<string, unknown>) ?? {},
    };
  }
  return map;
}
