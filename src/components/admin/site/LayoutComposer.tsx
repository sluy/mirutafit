"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TrashIcon, BlocksIcon } from "@/components/icons";
import type { PageLayout, LayoutRow } from "@/widgets/types";

type WidgetRow = { id: string; type: string; name: string };

const uid = () => crypto.randomUUID();
const COL_SPAN: Record<number, string> = {
  1: "md:col-span-1", 2: "md:col-span-2", 3: "md:col-span-3", 4: "md:col-span-4",
  5: "md:col-span-5", 6: "md:col-span-6", 7: "md:col-span-7", 8: "md:col-span-8",
  9: "md:col-span-9", 10: "md:col-span-10", 11: "md:col-span-11", 12: "md:col-span-12",
};

// A placement's sortable id encodes its column + index: "placed::<colId>::<index>".
const placedId = (colId: string, index: number) => `placed::${colId}::${index}`;

export default function LayoutComposer({
  slug,
  initialLayout,
  widgets,
  savedAction,
}: {
  slug: string;
  initialLayout: PageLayout;
  widgets: WidgetRow[];
  savedAction: (slug: string, layout: PageLayout) => Promise<{ ok: boolean }>;
}) {
  const t = useTranslations("admin.layout");
  const tw = useTranslations("admin.widgets");
  const router = useRouter();

  const [layout, setLayout] = useState<PageLayout>(initialLayout);
  const [saving, setSaving] = useState(false);
  const [dragName, setDragName] = useState<string | null>(null);

  const byId = Object.fromEntries(widgets.map((w) => [w.id, w]));
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // ── Layout mutations ──
  const setRows = (rows: LayoutRow[]) => setLayout({ rows });
  const addRow = () => setRows([...layout.rows, { id: uid(), columns: [{ id: uid(), span: 12, widgetIds: [] }] }]);
  const removeRow = (rowId: string) => setRows(layout.rows.filter((r) => r.id !== rowId));
  const addColumn = (rowId: string) =>
    setRows(layout.rows.map((r) => (r.id === rowId ? { ...r, columns: [...r.columns, { id: uid(), span: 6, widgetIds: [] }] } : r)));
  const removeColumn = (rowId: string, colId: string) =>
    setRows(layout.rows.map((r) => (r.id === rowId ? { ...r, columns: r.columns.filter((c) => c.id !== colId) } : r)));
  const setSpan = (rowId: string, colId: string, span: number) =>
    setRows(layout.rows.map((r) => (r.id === rowId ? { ...r, columns: r.columns.map((c) => (c.id === colId ? { ...c, span: Math.min(12, Math.max(1, span)) } : c)) } : r)));

  const mapCol = (colId: string, fn: (ids: string[]) => string[]) =>
    setRows(layout.rows.map((r) => ({ ...r, columns: r.columns.map((c) => (c.id === colId ? { ...c, widgetIds: fn(c.widgetIds) } : c)) })));

  const removeWidgetAt = (colId: string, index: number) => mapCol(colId, (ids) => ids.filter((_, i) => i !== index));

  // Clone helper for cross-column moves.
  const cloneRows = (rows: LayoutRow[]) =>
    rows.map((r) => ({ ...r, columns: r.columns.map((c) => ({ ...c, widgetIds: [...c.widgetIds] })) }));
  const findCol = (rows: LayoutRow[], colId: string) =>
    rows.flatMap((r) => r.columns).find((c) => c.id === colId);

  const moveWidget = (fromCol: string, fromIdx: number, toCol: string, toIdx: number) => {
    setLayout((prev) => {
      const rows = cloneRows(prev.rows);
      const src = findCol(rows, fromCol);
      const dst = findCol(rows, toCol);
      if (!src || !dst) return prev;
      if (fromCol === toCol) {
        src.widgetIds = arrayMove(src.widgetIds, fromIdx, toIdx);
      } else {
        const [moved] = src.widgetIds.splice(fromIdx, 1);
        if (moved == null) return prev;
        dst.widgetIds.splice(Math.min(toIdx, dst.widgetIds.length), 0, moved);
      }
      return { rows };
    });
  };

  const insertWidget = (toCol: string, toIdx: number, widgetId: string) => {
    setLayout((prev) => {
      const rows = cloneRows(prev.rows);
      const dst = findCol(rows, toCol);
      if (!dst) return prev;
      dst.widgetIds.splice(Math.min(toIdx, dst.widgetIds.length), 0, widgetId);
      return { rows };
    });
  };

  // ── Drag & drop ──
  type Active =
    | { source: "palette"; widgetId: string }
    | { source: "placed"; colId: string; index: number; widgetId: string };

  const onDragStart = (e: DragStartEvent) => {
    const d = e.active.data.current as Active | undefined;
    if (d) setDragName(byId[d.widgetId]?.name ?? null);
  };

  const onDragEnd = (e: DragEndEvent) => {
    setDragName(null);
    const active = e.active.data.current as Active | undefined;
    const over = e.over?.data.current as
      | { source?: "placed"; colId?: string; index?: number }
      | undefined;
    if (!active || !over?.colId) return;

    const targetCol = over.colId;
    // Over a placed item → use its index; over an (empty) column → append.
    const targetIndex = over.source === "placed" && typeof over.index === "number"
      ? over.index
      : findCol(layout.rows, targetCol)?.widgetIds.length ?? 0;

    if (active.source === "palette") {
      insertWidget(targetCol, targetIndex, active.widgetId);
    } else {
      if (active.colId === targetCol && active.index === targetIndex) return;
      moveWidget(active.colId, active.index, targetCol, targetIndex);
    }
  };

  const save = async () => {
    setSaving(true);
    const { ok } = await savedAction(slug, layout);
    setSaving(false);
    if (ok) {
      toast.success(t("saved"));
      router.refresh();
    } else {
      toast.error(t("error"));
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-ink">{t("title")}</h1>
          <p className="mt-1 text-ink/60">{t("subtitle")}</p>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition-transform hover:scale-105 disabled:opacity-60"
        >
          {saving ? "…" : t("save")}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Palette */}
        <aside className="h-fit rounded-2xl border border-ink/5 bg-white p-4 shadow-sm lg:sticky lg:top-4">
          <p className="mb-1 text-sm font-semibold text-ink">{t("widgets")}</p>
          <p className="mb-3 text-xs text-ink/40">{t("widgetsHint")}</p>
          {widgets.length === 0 ? (
            <p className="text-xs text-ink/40">{t("noWidgets")}</p>
          ) : (
            <div className="space-y-2">
              {widgets.map((w) => (
                <PaletteItem key={w.id} widget={w} typeLabel={tw(`types.${w.type}`)} />
              ))}
            </div>
          )}
        </aside>

        {/* Canvas */}
        <div className="space-y-4">
          {layout.rows.length === 0 && (
            <p className="rounded-2xl border-2 border-dashed border-ink/10 p-8 text-center text-sm text-ink/40">
              {t("resetHint")}
            </p>
          )}

          {layout.rows.map((row) => (
            <div key={row.id} className="rounded-2xl border border-ink/10 bg-gray-50/60 p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex gap-1">
                  <button type="button" onClick={() => addColumn(row.id)} className="rounded-lg px-2 py-1 text-xs font-medium text-ink/50 hover:bg-ink/5 hover:text-brand">
                    + {t("addColumn")}
                  </button>
                </div>
                <button type="button" onClick={() => removeRow(row.id)} className="grid h-7 w-7 place-items-center rounded-lg text-ink/30 hover:bg-red-50 hover:text-red-600">
                  <TrashIcon width={15} height={15} />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                {row.columns.map((col) => (
                  <Column
                    key={col.id}
                    colId={col.id}
                    span={col.span}
                    spanClass={COL_SPAN[col.span] ?? "md:col-span-12"}
                    widgetIds={col.widgetIds}
                    byId={byId}
                    typeLabel={(type) => tw(`types.${type}`)}
                    onSpan={(s) => setSpan(row.id, col.id, s)}
                    onRemoveCol={() => removeColumn(row.id, col.id)}
                    onRemoveWidget={(i) => removeWidgetAt(col.id, i)}
                    labels={{ span: t("span"), emptyColumn: t("emptyColumn"), removeColumn: t("removeColumn") }}
                  />
                ))}
              </div>
            </div>
          ))}

          <button type="button" onClick={addRow} className="w-full rounded-2xl border-2 border-dashed border-ink/15 py-3 text-sm font-medium text-ink/50 transition-colors hover:border-brand hover:text-brand">
            + {t("addRow")}
          </button>
        </div>
      </div>

      <DragOverlay>
        {dragName ? (
          <div className="rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white shadow-xl">{dragName}</div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function PaletteItem({ widget, typeLabel }: { widget: WidgetRow; typeLabel: string }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${widget.id}`,
    data: { source: "palette", widgetId: widget.id },
  });
  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      type="button"
      className={`flex w-full cursor-grab items-center gap-2 rounded-xl border border-ink/10 bg-white p-2.5 text-left active:cursor-grabbing ${isDragging ? "opacity-40" : ""}`}
    >
      <BlocksIcon width={16} height={16} className="shrink-0 text-brand" />
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-ink">{widget.name}</span>
        <span className="block text-[10px] uppercase tracking-wide text-ink/40">{typeLabel}</span>
      </span>
    </button>
  );
}

function Column({
  colId,
  span,
  spanClass,
  widgetIds,
  byId,
  typeLabel,
  onSpan,
  onRemoveCol,
  onRemoveWidget,
  labels,
}: {
  colId: string;
  span: number;
  spanClass: string;
  widgetIds: string[];
  byId: Record<string, WidgetRow>;
  typeLabel: (type: string) => string;
  onSpan: (s: number) => void;
  onRemoveCol: () => void;
  onRemoveWidget: (i: number) => void;
  labels: { span: string; emptyColumn: string; removeColumn: string };
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `col-${colId}`, data: { colId } });
  const items = widgetIds.map((_, i) => placedId(colId, i));

  return (
    <div className={spanClass}>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label className="flex items-center gap-1 text-[11px] text-ink/40">
          {labels.span}
          <select value={span} onChange={(e) => onSpan(Number(e.target.value))} className="rounded border border-ink/10 bg-white px-1 py-0.5 text-xs">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>
        <button type="button" onClick={onRemoveCol} aria-label={labels.removeColumn} className="text-ink/30 hover:text-red-600">
          <TrashIcon width={13} height={13} />
        </button>
      </div>
      <div
        ref={setNodeRef}
        className={`min-h-[80px] space-y-2 rounded-xl border-2 border-dashed p-2 transition-colors ${
          isOver ? "border-brand bg-brand/5" : "border-ink/10 bg-white"
        }`}
      >
        {widgetIds.length === 0 && (
          <p className="py-4 text-center text-xs text-ink/30">{labels.emptyColumn}</p>
        )}
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {widgetIds.map((wid, i) => (
            <PlacedWidget
              key={placedId(colId, i)}
              sortId={placedId(colId, i)}
              colId={colId}
              index={i}
              widget={byId[wid]}
              typeLabel={byId[wid] ? typeLabel(byId[wid].type) : "?"}
              onRemove={() => onRemoveWidget(i)}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

function PlacedWidget({
  sortId,
  colId,
  index,
  widget,
  typeLabel,
  onRemove,
}: {
  sortId: string;
  colId: string;
  index: number;
  widget: WidgetRow | undefined;
  typeLabel: string;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: sortId,
    data: { source: "placed", colId, index, widgetId: widget?.id },
  });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-1 rounded-lg border border-ink/10 bg-gray-50 p-1.5 ${isDragging ? "opacity-40" : ""}`}
    >
      <span {...listeners} {...attributes} className="flex min-w-0 flex-1 cursor-grab items-center gap-2 touch-none active:cursor-grabbing">
        <BlocksIcon width={14} height={14} className="shrink-0 text-brand" />
        <span className="min-w-0">
          <span className="block truncate text-xs font-medium text-ink">{widget?.name ?? "—"}</span>
          <span className="block text-[9px] uppercase tracking-wide text-ink/40">{typeLabel}</span>
        </span>
      </span>
      <button type="button" onClick={onRemove} className="text-ink/30 hover:text-red-600">
        <TrashIcon width={13} height={13} />
      </button>
    </div>
  );
}
