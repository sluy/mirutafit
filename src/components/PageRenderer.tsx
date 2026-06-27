import { WIDGET_RENDER } from "@/widgets/render";
import { isWidgetType } from "@/widgets/meta";
import type { PageLayout, WidgetInstance } from "@/widgets/types";

// Static span classes so Tailwind can see them.
const COL_SPAN: Record<number, string> = {
  1: "md:col-span-1",
  2: "md:col-span-2",
  3: "md:col-span-3",
  4: "md:col-span-4",
  5: "md:col-span-5",
  6: "md:col-span-6",
  7: "md:col-span-7",
  8: "md:col-span-8",
  9: "md:col-span-9",
  10: "md:col-span-10",
  11: "md:col-span-11",
  12: "md:col-span-12",
};

function isFixed(widget: WidgetInstance): boolean {
  return (widget.config as { fixed?: boolean })?.fixed === true;
}

function renderWidget(widget: WidgetInstance) {
  if (!isWidgetType(widget.type)) return null;
  const Render = WIDGET_RENDER[widget.type];
  if (!Render) return null;
  return <Render config={widget.config} />;
}

/**
 * Renders a page from its layout (rows -> 12-col grid -> widget instances).
 *
 * Widgets whose config has `fixed: true` are lifted out of the grid into a
 * single pinned top stack, so multiple fixed bars (e.g. a social bar + a navbar)
 * stack neatly instead of overlapping. Everything else flows in the grid.
 */
export default function PageRenderer({
  layout,
  widgets,
}: {
  layout: PageLayout;
  widgets: Record<string, WidgetInstance>;
}) {
  // Collect fixed widgets in document order for the pinned top stack.
  const pinned: WidgetInstance[] = [];
  for (const row of layout.rows) {
    for (const col of row.columns) {
      for (const wid of col.widgetIds) {
        const w = widgets[wid];
        if (w && isFixed(w)) pinned.push(w);
      }
    }
  }

  return (
    <>
      {pinned.length > 0 && (
        <div className="fixed inset-x-0 top-0 z-50">
          {pinned.map((w) => (
            <div key={w.id}>{renderWidget(w)}</div>
          ))}
        </div>
      )}

      {layout.rows.map((row) => (
        <section key={row.id} className="grid grid-cols-1 gap-6 md:grid-cols-12">
          {row.columns.map((col) => (
            <div key={col.id} className={COL_SPAN[col.span] ?? "md:col-span-12"}>
              {col.widgetIds.map((wid) => {
                const w = widgets[wid];
                // Fixed widgets are rendered in the pinned stack above.
                if (!w || isFixed(w)) return null;
                // `id` anchor lets the navbar reference/scroll to this section.
                return (
                  <div key={wid} id={`w-${wid}`} className="scroll-mt-24">
                    {renderWidget(w)}
                  </div>
                );
              })}
            </div>
          ))}
        </section>
      ))}
    </>
  );
}
