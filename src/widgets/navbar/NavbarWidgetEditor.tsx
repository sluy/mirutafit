"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  DndContext,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { inputClass } from "@/components/ui/Field";
import { TrashIcon } from "@/components/icons";
import { useLocalized } from "../LocaleContext";
import {
  listTaxonomyOptionsAction,
  type Option,
} from "@/app/admin/content/actions";
import { listWidgetOptionsAction } from "@/app/admin/widgets/actions";
import type {
  NavbarConfig,
  NavItem,
  NavItemType,
  NavZone,
  WidgetEditorProps,
} from "../types";

const PRESET_COLORS = [
  { label: "transparent", value: "transparent" },
  { label: "#000000", value: "#000000" },
  { label: "#1a1a2e", value: "#1a1a2e" },
  { label: "#16213e", value: "#16213e" },
  { label: "#0f3460", value: "#0f3460" },
  { label: "#533483", value: "#533483" },
];
const CHECKER: React.CSSProperties = {
  backgroundImage: "repeating-conic-gradient(#e5e7eb 0% 25%, #ffffff 0% 50%)",
  backgroundSize: "20px 20px",
};
const ZONES: NavZone[] = ["left", "center", "right"];
const ADDABLE: NavItemType[] = ["home", "link", "widget", "categories", "language", "auth", "support"];

const defaultItems = (): NavItem[] => [
  { id: crypto.randomUUID(), type: "home", zone: "left", style: "text", label: "", url: "", widgetId: "" },
  { id: crypto.randomUUID(), type: "categories", zone: "center", style: "text", label: "", url: "", widgetId: "" },
  { id: crypto.randomUUID(), type: "auth", zone: "right", style: "text", label: "", url: "", widgetId: "" },
  { id: crypto.randomUUID(), type: "support", zone: "right", style: "button", label: "", url: "#apoyo", widgetId: "" },
];

const ADD_ZONE: Record<NavItemType, NavZone> = {
  home: "left", link: "left", widget: "center", categories: "center", language: "right", auth: "right", support: "right",
};

export default function NavbarWidgetEditor({ config, onChange }: WidgetEditorProps<NavbarConfig>) {
  const t = useTranslations("admin.widgets.navbar");
  const set = (patch: Partial<NavbarConfig>) => onChange({ ...config, ...patch });

  const items: NavItem[] = Array.isArray(config.items) ? config.items : [];
  const setItems = (next: NavItem[]) => set({ items: next });

  const [categories, setCategories] = useState<Option[]>([]);
  const [widgets, setWidgets] = useState<{ id: string; name: string; type: string }[]>([]);
  useEffect(() => {
    listTaxonomyOptionsAction("category").then(setCategories).catch(() => {});
    listWidgetOptionsAction().then(setWidgets).catch(() => {});
  }, []);

  const selectedCats = config.menuCategories ?? [];
  const toggleCategory = (key: string) =>
    set({ menuCategories: selectedCats.includes(key) ? selectedCats.filter((k) => k !== key) : [...selectedCats, key] });

  const updateItem = (id: string, patch: Partial<NavItem>) =>
    setItems(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  const removeItem = (id: string) => setItems(items.filter((i) => i.id !== id));
  const addItem = (type: NavItemType) =>
    setItems([
      ...items,
      { id: crypto.randomUUID(), type, zone: ADD_ZONE[type], style: type === "support" ? "button" : "text", label: "", url: type === "support" ? "#apoyo" : "", widgetId: "" },
    ]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const onDragEnd = (e: DragEndEvent) => {
    const activeId = String(e.active.id);
    const overId = e.over ? String(e.over.id) : null;
    if (!overId || activeId === overId) return;
    const active = items.find((i) => i.id === activeId);
    if (!active) return;

    let targetZone: NavZone;
    let overItem: NavItem | undefined;
    if (overId.startsWith("zone-")) targetZone = overId.slice(5) as NavZone;
    else {
      overItem = items.find((i) => i.id === overId);
      if (!overItem) return;
      targetZone = overItem.zone;
    }

    const next = items.filter((i) => i.id !== activeId);
    const moved: NavItem = { ...active, zone: targetZone };
    if (overItem) {
      next.splice(next.findIndex((i) => i.id === overItem!.id), 0, moved);
    } else {
      let lastIdx = -1;
      next.forEach((i, k) => { if (i.zone === targetZone) lastIdx = k; });
      next.splice(lastIdx + 1, 0, moved);
    }
    setItems(next);
  };

  return (
    <div className="space-y-7">
      {/* ── Colors (mode + top + scrolled) ── */}
      <div>
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/40">{t("mode")}</span>
        <div className="flex gap-2">
          <button type="button" onClick={() => set({ fixed: false })} className={`rounded-xl border px-5 py-2 text-sm font-medium transition-colors ${!config.fixed ? "border-brand bg-brand/10 text-brand" : "border-ink/10 text-ink/60 hover:border-brand/40"}`}>{t("modeNormal")}</button>
          <button type="button" onClick={() => set({ fixed: true })} className={`rounded-xl border px-5 py-2 text-sm font-medium transition-colors ${config.fixed ? "border-brand bg-brand/10 text-brand" : "border-ink/10 text-ink/60 hover:border-brand/40"}`}>{t("modeFixed")}</button>
        </div>
        <p className="mt-1 text-xs text-ink/40">{t("modeHint")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink/40">{t("topBg")}</span>
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              {PRESET_COLORS.map((c) => (
                <button key={c.value} type="button" onClick={() => set({ topBg: c.value })} title={c.label} className={`h-8 w-8 rounded-lg border-2 transition-transform hover:scale-110 ${config.topBg === c.value ? "border-brand ring-2 ring-brand/30" : "border-ink/10"}`} style={c.value === "transparent" ? CHECKER : { backgroundColor: c.value }} />
              ))}
            </div>
            <input type="color" value={config.topBg === "transparent" ? "#000000" : config.topBg} onChange={(e) => set({ topBg: e.target.value })} className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent p-0" />
            <input value={config.topBg} onChange={(e) => set({ topBg: e.target.value })} className={`${inputClass()} max-w-[140px]`} />
          </div>
        </div>
        <div>
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink/40">{t("topText")}</span>
          <div className="flex items-center gap-2">
            <input type="color" value={config.topText} onChange={(e) => set({ topText: e.target.value })} className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent p-0" />
            <input value={config.topText} onChange={(e) => set({ topText: e.target.value })} className={`${inputClass()} max-w-[140px]`} />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-ink/10 bg-gray-50 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink/40">{t("scrolled")}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <span className="mb-1 block text-xs font-medium text-ink/50">{t("scrolledBg")}</span>
            <div className="flex items-center gap-2">
              <input type="color" value={config.scrolledBg ?? "#ffffff"} onChange={(e) => set({ scrolledBg: e.target.value })} className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent p-0" />
              <input value={config.scrolledBg ?? "#ffffff"} onChange={(e) => set({ scrolledBg: e.target.value })} className={`${inputClass()} max-w-[140px]`} />
            </div>
          </div>
          <div>
            <span className="mb-1 block text-xs font-medium text-ink/50">{t("scrolledText")}</span>
            <div className="flex items-center gap-2">
              <input type="color" value={config.scrolledText ?? "#0a1410"} onChange={(e) => set({ scrolledText: e.target.value })} className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent p-0" />
              <input value={config.scrolledText ?? "#0a1410"} onChange={(e) => set({ scrolledText: e.target.value })} className={`${inputClass()} max-w-[140px]`} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Brand ── */}
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-ink/80">
          <input type="checkbox" checked={config.showBrand} onChange={(e) => set({ showBrand: e.target.checked })} className="h-4 w-4 rounded border-ink/20 text-brand focus:ring-brand" />
          {t("showBrand")}
        </label>
        {config.showBrand && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink/40">{t("brandZone")}</span>
            <div className="flex gap-1">
              {ZONES.map((z) => (
                <button key={z} type="button" onClick={() => set({ brandZone: z })} className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${(config.brandZone ?? "left") === z ? "bg-brand text-white" : "bg-ink/5 text-ink/60 hover:bg-brand/10 hover:text-brand"}`}>{t(`zone_${z}`)}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Items builder ── */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink/40">{t("items")}</span>
          {items.length === 0 && (
            <button type="button" onClick={() => setItems(defaultItems())} className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand hover:bg-brand/20">{t("loadDefault")}</button>
          )}
        </div>
        <p className="mb-3 text-xs text-ink/40">{t("itemsHint")}</p>

        <div className="mb-3 flex flex-wrap gap-1.5">
          {ADDABLE.map((type) => (
            <button key={type} type="button" onClick={() => addItem(type)} className="rounded-full border border-ink/10 px-3 py-1 text-xs font-medium text-ink/60 hover:border-brand hover:text-brand">+ {t(`type_${type}`)}</button>
          ))}
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={onDragEnd}>
          <div className="grid gap-3 md:grid-cols-3">
            {ZONES.map((z) => (
              <Zone key={z} zone={z} label={t(`zone_${z}`)} emptyLabel={t("zoneEmpty")} items={items.filter((i) => i.zone === z)}>
                {items.filter((i) => i.zone === z).map((item) => (
                  <ItemCard key={item.id} item={item} t={t} widgets={widgets} onUpdate={updateItem} onRemove={removeItem} />
                ))}
              </Zone>
            ))}
          </div>
        </DndContext>
      </div>

      {/* ── Menu categories (used by a "categories" item) ── */}
      <div>
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/40">{t("menuCategories")}</span>
        {categories.length === 0 ? (
          <p className="text-xs text-ink/40">{t("menuCategoriesEmpty")}</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {categories.map((c) => {
              const idx = selectedCats.indexOf(c.key);
              const on = idx >= 0;
              return (
                <button key={c.key} type="button" onClick={() => toggleCategory(c.key)} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${on ? "bg-brand text-white" : "bg-ink/5 text-ink/60 hover:bg-brand/10 hover:text-brand"}`}>
                  {on && <span className="text-[10px] opacity-80">{idx + 1}</span>}
                  {c.label}
                </button>
              );
            })}
          </div>
        )}
        <p className="mt-1 text-xs text-ink/40">{t("menuCategoriesHint")}</p>
      </div>
    </div>
  );
}

function Zone({
  zone,
  label,
  emptyLabel,
  items,
  children,
}: {
  zone: NavZone;
  label: string;
  emptyLabel: string;
  items: NavItem[];
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-gray-50/60 p-2.5">
      <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-ink/50">{label}</p>
      <ZoneDroppable zone={zone}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="min-h-[60px] space-y-2">
            {items.length === 0 && <p className="py-4 text-center text-[11px] text-ink/30">{emptyLabel}</p>}
            {children}
          </div>
        </SortableContext>
      </ZoneDroppable>
    </div>
  );
}

function ZoneDroppable({ zone, children }: { zone: NavZone; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: `zone-${zone}` });
  return (
    <div ref={setNodeRef} className={`rounded-xl transition-colors ${isOver ? "bg-brand/5" : ""}`}>
      {children}
    </div>
  );
}

function ItemCard({
  item,
  t,
  widgets,
  onUpdate,
  onRemove,
}: {
  item: NavItem;
  t: ReturnType<typeof useTranslations>;
  widgets: { id: string; name: string; type: string }[];
  onUpdate: (id: string, patch: Partial<NavItem>) => void;
  onRemove: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const lt = useLocalized();
  const style = { transform: CSS.Transform.toString(transform), transition };
  const showLabel = item.type === "home" || item.type === "link" || item.type === "widget" || item.type === "support";
  const showStyle = item.type !== "auth" && item.type !== "language";

  return (
    <div ref={setNodeRef} style={style} className={`rounded-xl border border-ink/10 bg-white p-2.5 shadow-sm ${isDragging ? "opacity-50" : ""}`}>
      <div className="mb-2 flex items-center gap-2">
        <span {...listeners} {...attributes} className="cursor-grab touch-none text-ink/30 active:cursor-grabbing">⠿</span>
        <span className="flex-1 text-xs font-semibold text-ink">{t(`type_${item.type}`)}</span>
        {showStyle && (
          <div className="flex overflow-hidden rounded-md border border-ink/10 text-[10px]">
            <button type="button" onClick={() => onUpdate(item.id, { style: "text" })} className={`px-2 py-0.5 ${item.style === "text" ? "bg-brand text-white" : "text-ink/50"}`}>{t("styleText")}</button>
            <button type="button" onClick={() => onUpdate(item.id, { style: "button" })} className={`px-2 py-0.5 ${item.style === "button" ? "bg-brand text-white" : "text-ink/50"}`}>{t("styleButton")}</button>
          </div>
        )}
        <button type="button" onClick={() => onRemove(item.id)} className="text-ink/30 hover:text-red-600"><TrashIcon width={13} height={13} /></button>
      </div>

      {showLabel && (
        <input value={lt.g(item.label)} onChange={(e) => onUpdate(item.id, { label: lt.s(item.label, e.target.value) })} placeholder={t("itemLabelPlaceholder")} className={`${inputClass()} mb-1.5 py-1.5 text-xs`} />
      )}
      {item.type === "link" && (
        <input value={item.url} onChange={(e) => onUpdate(item.id, { url: e.target.value })} placeholder="https://… or #section" className={`${inputClass()} py-1.5 text-xs font-mono`} />
      )}
      {item.type === "widget" && (
        widgets.length === 0 ? (
          <p className="text-[11px] text-ink/40">{t("noWidgets")}</p>
        ) : (
          <select value={item.widgetId} onChange={(e) => onUpdate(item.id, { widgetId: e.target.value })} className={`${inputClass()} py-1.5 text-xs`}>
            <option value="">{t("pickWidget")}</option>
            {widgets.map((w) => (<option key={w.id} value={w.id}>{w.name}</option>))}
          </select>
        )
      )}
      {item.type === "categories" && <p className="text-[11px] text-ink/40">{t("categoriesNote")}</p>}
      {item.type === "language" && <p className="text-[11px] text-ink/40">{t("languageNote")}</p>}
    </div>
  );
}
