import type { ComponentType } from "react";
import RichTextWidget from "./richText/RichTextWidget";
import SliderWidget from "./slider/SliderWidget";
import NavbarWidget from "./navbar/NavbarWidget";
import SocialBarWidget from "./socialBar/SocialBarWidget";
import FooterWidget from "./footer/FooterWidget";
import ArticlesWidget from "./articles/ArticlesWidget";
import ContactWidget from "./contact/ContactWidget";
import DonationsWidget from "./donations/DonationsWidget";
import CommunityWidget from "./community/CommunityWidget";
import GoTopWidget from "./goTop/GoTopWidget";
import type { WidgetTypeKey } from "./meta";

/** type -> frontend render component. Used by the page renderer. */
export const WIDGET_RENDER: Record<
  WidgetTypeKey,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ComponentType<{ config: any }>
> = {
  richText: RichTextWidget,
  slider: SliderWidget,
  navbar: NavbarWidget,
  socialBar: SocialBarWidget,
  footer: FooterWidget,
  articles: ArticlesWidget,
  contact: ContactWidget,
  donations: DonationsWidget,
  community: CommunityWidget,
  goTop: GoTopWidget,
};
