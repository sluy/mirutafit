import { prisma } from "@/lib/prisma";
import { getOrCreatePage, pageLayout } from "@/lib/pages";
import { PLACEABLE_WIDGET_TYPES } from "@/widgets/meta";
import LayoutComposer from "@/components/admin/site/LayoutComposer";
import { savePageLayoutAction } from "./actions";

export default async function AdminLayoutPage() {
  const page = await getOrCreatePage("home", "Home");
  const layout = pageLayout(page);
  // Only body-placeable widgets (excludes chrome singletons like navbar/footer).
  const widgets = await prisma.widget.findMany({
    where: { type: { in: PLACEABLE_WIDGET_TYPES } },
    orderBy: { updatedAt: "desc" },
    select: { id: true, type: true, name: true },
  });

  return (
    <LayoutComposer
      slug="home"
      initialLayout={layout}
      widgets={widgets}
      savedAction={savePageLayoutAction}
    />
  );
}
