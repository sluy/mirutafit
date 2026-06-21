import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isWidgetType, isSingletonType } from "@/widgets/meta";
import type { WidgetTypeKey } from "@/widgets/meta";
import WidgetTypeList from "@/components/admin/widgets/WidgetTypeList";
import SingletonEditorScreen from "@/components/admin/widgets/SingletonEditorScreen";
import { getNavbarConfig, getFooterConfig } from "@/lib/settings";
import {
  saveNavbarConfigAction,
  saveFooterConfigAction,
} from "@/app/admin/widgets/singleton-actions";

export default async function WidgetTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  if (!isWidgetType(type)) notFound();

  // Singleton types (navbar, footer) get a direct config editor instead of a
  // list of instances.
  if (isSingletonType(type)) {
    const config = await loadSingletonConfig(type);
    const action = singletonSaveAction(type);
    return (
      <SingletonEditorScreen
        type={type}
        initialConfig={config as Record<string, unknown>}
        saveAction={action}
      />
    );
  }

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

// ── Helpers ─────────────────────────────────────────────────────

async function loadSingletonConfig(type: WidgetTypeKey) {
  switch (type) {
    case "navbar":
      return getNavbarConfig();
    case "footer":
      return getFooterConfig();
    default:
      return {};
  }
}

function singletonSaveAction(type: WidgetTypeKey) {
  switch (type) {
    case "navbar":
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return saveNavbarConfigAction as any;
    case "footer":
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return saveFooterConfigAction as any;
    default:
      return async () => ({ ok: false });
  }
}
