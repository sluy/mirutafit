"use client";

import type { ComponentType } from "react";
import RichTextWidgetEditor from "./richText/RichTextWidgetEditor";
import SliderWidgetEditor from "./slider/SliderWidgetEditor";
import NavbarWidgetEditor from "./navbar/NavbarWidgetEditor";
import SocialBarWidgetEditor from "./socialBar/SocialBarWidgetEditor";
import FooterWidgetEditor from "./footer/FooterWidgetEditor";
import ArticlesWidgetEditor from "./articles/ArticlesWidgetEditor";
import ContactWidgetEditor from "./contact/ContactWidgetEditor";
import DonationsWidgetEditor from "./donations/DonationsWidgetEditor";
import CommunityWidgetEditor from "./community/CommunityWidgetEditor";
import GoTopWidgetEditor from "./goTop/GoTopWidgetEditor";
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
  socialBar: SocialBarWidgetEditor,
  footer: FooterWidgetEditor,
  articles: ArticlesWidgetEditor,
  contact: ContactWidgetEditor,
  donations: DonationsWidgetEditor,
  community: CommunityWidgetEditor,
  goTop: GoTopWidgetEditor,
};
