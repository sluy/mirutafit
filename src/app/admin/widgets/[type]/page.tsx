import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isWidgetType } from "@/widgets/meta";
import WidgetTypeList from "@/components/admin/widgets/WidgetTypeList";

export default async function WidgetTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  if (!isWidgetType(type)) notFound();

  const widgets = await prisma.widget.findMany({
    where: { type },
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, updatedAt: true },
  });

  return (
    <WidgetTypeList
      type={type}
      widgets={widgets.map((w) => ({
        id: w.id,
        name: w.name,
        updatedAt: w.updatedAt.toISOString(),
      }))}
    />
  );
}
