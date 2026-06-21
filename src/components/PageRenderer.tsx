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

/**
 * Renders a page from its layout (rows -> 12-col grid -> widget instances).
 * Each widget self-manages its own width/padding.
 */
export default function PageRenderer({
  layout,
  widgets,
}: {
  layout: PageLayout;
  widgets: Record<string, WidgetInstance>;
}) {
  return (
    <>
      {layout.rows.map((row) => (
        <section key={row.id} className="grid grid-cols-1 gap-6 md:grid-cols-12">
          {row.columns.map((col) => (
            <div key={col.id} className={COL_SPAN[col.span] ?? "md:col-span-12"}>
              {col.widgetIds.map((wid) => {
                const widget = widgets[wid];
                if (!widget || !isWidgetType(widget.type)) return null;
                const Render = WIDGET_RENDER[widget.type];
                return <Render key={wid} config={widget.config} />;
              })}
            </div>
          ))}
        </section>
      ))}
    </>
  );
}
