import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isWidgetType } from "@/widgets/meta";
import { getEnabledLocales } from "@/lib/locale";
import { getLocaleSettings } from "@/lib/settings";
import { localeNames } from "@/i18n/config";
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

  const [locales, settings] = await Promise.all([getEnabledLocales(), getLocaleSettings()]);
  const defaultLocale = (locales as string[]).includes(settings.fallback) ? settings.fallback : locales[0];

  return (
    <WidgetEditorScreen
      id={widget.id}
      type={widget.type}
      name={widget.name}
      config={(widget.config as Record<string, unknown>) ?? {}}
      locales={locales}
      defaultLocale={defaultLocale}
      localeNames={localeNames}
    />
  );
}
