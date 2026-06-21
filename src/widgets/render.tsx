import type { ComponentType } from "react";
import RichTextWidget from "./richText/RichTextWidget";
import SliderWidget from "./slider/SliderWidget";
import type { WidgetTypeKey } from "./meta";

/**
 * Placeholder for singleton widgets (navbar/footer). They are rendered by the
 * layout shell, not by the page body composer, so this is just a no-op.
 */
function SingletonPlaceholder() {
  return null;
}

/** type -> frontend render component. Used by the page renderer. */
export const WIDGET_RENDER: Record<
  WidgetTypeKey,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ComponentType<{ config: any }>
> = {
  richText: RichTextWidget,
  slider: SliderWidget,
  navbar: SingletonPlaceholder,
  footer: SingletonPlaceholder,
};
