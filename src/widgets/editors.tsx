"use client";

import type { ComponentType } from "react";
import RichTextWidgetEditor from "./richText/RichTextWidgetEditor";
import SliderWidgetEditor from "./slider/SliderWidgetEditor";
import NavbarWidgetEditor from "./navbar/NavbarWidgetEditor";
import FooterWidgetEditor from "./footer/FooterWidgetEditor";
import type { WidgetTypeKey } from "./meta";
import type { WidgetEditorProps } from "./types";

/** type -> admin config editor. Used by the widget library. */
export const WIDGET_EDITORS: Record<
  WidgetTypeKey,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ComponentType<WidgetEditorProps<any>>
> = {
  richText: RichTextWidgetEditor,
  slider: SliderWidgetEditor,
  navbar: NavbarWidgetEditor,
  footer: FooterWidgetEditor,
};
