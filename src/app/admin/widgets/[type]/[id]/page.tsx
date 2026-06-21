import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isWidgetType } from "@/widgets/meta";
import WidgetEditorScreen from "@/components/admin/widgets/WidgetEditorScreen";

export default async function EditWidgetPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const { type, id } = await params;
  if (!isWidgetType(type)) notFound();

  const widget = await prisma.widget.findUnique({ where: { id } });
  if (!widget || widget.type !== type) notFound();

  return (
    <WidgetEditorScreen
      id={widget.id}
      type={widget.type}
      name={widget.name}
      config={(widget.config as Record<string, unknown>) ?? {}}
    />
  );
}
