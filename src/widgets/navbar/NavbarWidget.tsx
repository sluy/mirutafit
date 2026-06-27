import { getLocale } from "next-intl/server";
import Navbar from "@/components/Navbar";
import { prisma } from "@/lib/prisma";
import { getMenuCategories } from "@/lib/taxonomy";
import { getLocaleOptions } from "@/lib/locale";
import { resolveText } from "../i18n";
import type { NavbarConfig, NavItem, ResolvedNavItem } from "../types";

/**
 * Server wrapper for the Navbar widget. Resolves the composed `items` (category
 * keys, referenced-widget names, …) into concrete labels + hrefs for the client
 * Navbar. Navbars saved before the builder existed (`items` empty) fall back to
 * the legacy rendering driven by `menuCategories`.
 */
export default async function NavbarWidget({ config }: { config: NavbarConfig }) {
  const locale = await getLocale();
  const items = Array.isArray(config.items) ? config.items : [];

  // Legacy navbar (no composed items) → keep the old behavior.
  if (items.length === 0) {
    const categories = await getMenuCategories(locale, config.menuCategories ?? []);
    return <Navbar config={config} categories={categories} />;
  }

  // Resolve widget names for "widget" references.
  const widgetIds = items.filter((i) => i.type === "widget" && i.widgetId).map((i) => i.widgetId);
  const widgetRows = widgetIds.length
    ? await prisma.widget.findMany({ where: { id: { in: widgetIds } }, select: { id: true, name: true } })
    : [];
  const widgetName = new Map(widgetRows.map((w) => [w.id, w.name]));

  // Category links (shared by any "categories" item).
  const categories = await getMenuCategories(locale, config.menuCategories ?? []);
  // Language options (the switcher only makes sense with more than one).
  const localeOptions = await getLocaleOptions();

  const resolved: ResolvedNavItem[] = [];
  const linkItem = (i: NavItem, label: string, href: string): ResolvedNavItem => ({
    id: i.id,
    zone: i.zone,
    style: i.style,
    kind: "link",
    label,
    href,
  });

  for (const i of items) {
    const label = resolveText(i.label, locale);
    switch (i.type) {
      case "home":
        resolved.push(linkItem(i, label || "Inicio", "/"));
        break;
      case "link":
        if (i.url) resolved.push(linkItem(i, label || i.url, i.url));
        break;
      case "widget":
        if (i.widgetId)
          resolved.push(linkItem(i, label || widgetName.get(i.widgetId) || "—", `#w-${i.widgetId}`));
        break;
      case "categories":
        for (const c of categories) {
          resolved.push({ id: `${i.id}-${c.key}`, zone: i.zone, style: i.style, kind: "link", label: c.label, href: c.href });
        }
        break;
      case "auth":
        resolved.push({ id: i.id, zone: i.zone, style: i.style, kind: "auth", label: "", href: "" });
        break;
      case "support":
        resolved.push({ id: i.id, zone: i.zone, style: i.style, kind: "support", label: label || "Apóyame", href: i.url || "#apoyo" });
        break;
      case "language":
        if (localeOptions.length > 1)
          resolved.push({ id: i.id, zone: i.zone, style: i.style, kind: "language", label: "", href: "" });
        break;
    }
  }

  return (
    <Navbar
      config={config}
      items={resolved}
      brandZone={config.brandZone ?? "left"}
      localeOptions={localeOptions}
      currentLocale={locale}
    />
  );
}
