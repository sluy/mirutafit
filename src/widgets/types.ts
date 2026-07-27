import type { LocalizedText, LocalizedList } from "./i18n";

// ── Layout (how a page is composed) ───────────────────────────
export type LayoutColumn = {
  id: string;
  span: number; // 1..12 (Tailwind grid columns)
  widgetIds: string[]; // widget instances stacked vertically in this column
};
export type LayoutRow = { id: string; columns: LayoutColumn[] };
export type PageLayout = { rows: LayoutRow[] };

export const emptyLayout: PageLayout = { rows: [] };

// ── A configured widget instance (from the library) ───────────
export type WidgetInstance = {
  id: string;
  type: string;
  name: string;
  config: Record<string, unknown>;
};

// ── Per-widget config shapes ──────────────────────────────────
export type RichTextHeightMode = "auto" | "fixed" | "full";
export type RichTextContainer = "standard" | "wide" | "full";
export type RichTextConfig = {
  html: LocalizedText;
  heightMode: RichTextHeightMode; // auto = fit content, fixed = px (scrolls), full = viewport
  height: number; // px, used when heightMode === "fixed"
  bg: string; // "transparent" or a hex background color
  container?: RichTextContainer;
};

export type SliderEffect = "slide" | "fade" | "cube" | "coverflow" | "flip" | "shatter";
export type ImagePosition = "center" | "top" | "bottom" | "left" | "right";
export type SliderSlide = {
  id: string;
  image: string | null; // media library fileName
  imagePosition: ImagePosition; // object-position for the background image
  content: LocalizedText; // rich HTML (replaces old title/subtitle/button)
  overlayColor: string; // hex, e.g. "#000000"
  overlayOpacity: number; // 0–100 (percentage)
  // Responsive: optional mobile-specific overrides (xs/sm)
  mobileEnabled: boolean;
  mobileImage: string | null;
  mobileImagePosition: ImagePosition;
  mobileContent: LocalizedText;
  mobileOverlayColor: string;
  mobileOverlayOpacity: number;
  // Legacy fields (kept for backwards-compatible read migration)
  title?: LocalizedText;
  subtitle?: LocalizedText;
  buttonText?: LocalizedText;
  buttonLink?: string;
};
export type SliderConfig = {
  effect: SliderEffect;
  autoplay: boolean;
  interval: number; // ms
  height: number; // px (ignored when fullHeight)
  fullHeight: boolean; // occupy the full browser viewport height
  slides: SliderSlide[];
};

export type SocialAlign = "left" | "center" | "right";

// All widgets are placed in the layout to appear — there is no per-widget
// "enabled" flag. Chrome-like widgets (navbar, social bar) can be pinned.

// ── Navbar builder ────────────────────────────────────────────
export type NavZone = "left" | "center" | "right";
export type NavItemStyle = "text" | "button";
// home = link to "/", auth = login/session area, support = the CTA button,
// categories = expands the dynamic article-category links, link = a manual URL,
// widget = an anchor that scrolls to a placed widget's section,
// language = the language switcher (only shown when >1 locale is enabled).
export type NavItemType =
  | "home"
  | "auth"
  | "support"
  | "categories"
  | "link"
  | "widget"
  | "language";

export type NavItem = {
  id: string;
  type: NavItemType;
  zone: NavZone;
  style: NavItemStyle;
  label: LocalizedText; // custom label (per-locale); empty → a default per type
  url: string; // type "link" (and optional override for "support")
  widgetId: string; // type "widget" — the referenced widget instance
};

// Navbar widget.
export type NavbarConfig = {
  topBg: string; // "transparent" or a hex color (background at scroll 0)
  topText: string; // hex text color at scroll 0
  scrolledBg: string; // hex background once scrolled
  scrolledText: string; // hex text color once scrolled
  showBrand: boolean;
  brandZone: NavZone; // where the logo sits
  fixed: boolean; // pinned to the top (overlays content) vs in normal flow
  menuCategories: string[]; // ordered category keys → dynamic /articles links
  items: NavItem[]; // the composed bar; when empty the legacy layout is used
};

// A resolved navbar menu entry (label in the current locale + target href).
export type MenuCategory = { key: string; label: string; href: string };

// What the server hands the client Navbar after resolving labels/hrefs.
export type ResolvedNavKind = "link" | "auth" | "support" | "language";
export type ResolvedNavItem = {
  id: string;
  zone: NavZone;
  style: NavItemStyle;
  kind: ResolvedNavKind;
  label: string;
  href: string; // for "link" / "support"
};

export type LocaleOption = { code: string; label: string };

// Social bar widget (its own placeable bar of social icons).
export type SocialBarConfig = {
  bg: string; // hex background
  text: string; // hex icon color
  hover: string; // hex hover color of the icons
  align: SocialAlign; // where the social buttons sit
  fixed: boolean; // pinned to the top vs in normal flow
};

// Footer widget — configurable columns of links + newsletter + legal line.
export type FooterLinkType = "link" | "widget"; // manual URL/anchor, or a widget anchor
export type FooterLink = {
  id: string;
  type: FooterLinkType;
  label: LocalizedText;
  url: string; // for "link" (URL, "/route" or "#anchor")
  widgetId: string; // for "widget" — scrolls to that placed widget
};
export type FooterColumn = {
  id: string;
  title: LocalizedText;
  links: FooterLink[];
};
export type FooterConfig = {
  showSocial: boolean;
  showNewsletter: boolean;
  tagline: LocalizedText;
  newsletterTitle: LocalizedText;
  newsletterText: LocalizedText;
  copyright: LocalizedText; // shown after "© {year} MiRutaFit."
  madeWith: LocalizedText; // the small signature line
  columns: FooterColumn[];
};

// Articles widget (a grid of article cards from the Articles module).
export type ArticlesWidgetMode = "latest" | "first" | "manual";
export type ArticlesConfig = {
  heading: LocalizedText; // empty → falls back to the translated "Artículos"
  mode: ArticlesWidgetMode;
  count: number; // how many to show (ignored for manual)
  categoryKey: string | null; // optional filter for latest/first
  articleIds: string[]; // ordered, for mode "manual"
  columns: number; // grid columns (2..4)
  showViewAll: boolean; // show the "Ver todos" link
};

// Contact widget (a configurable banner + form with two modes).
export type ContactWidgetMode = "person" | "brand";
export type ContactModeContent = {
  toggleLabel: LocalizedText; // label on the mode switch, e.g. "Soy una persona"
  badge: LocalizedText; // small pill on the banner, e.g. "Para ti 💪"
  bannerTitle: LocalizedText;
  bannerText: LocalizedText;
  points: LocalizedList; // bullet list of selling points
  topics: LocalizedList; // options for the "topic" dropdown
  placeholder: LocalizedText; // message textarea placeholder
};
export type ContactConfig = {
  eyebrow: LocalizedText; // small heading above the title, e.g. "Hablemos"
  heading: LocalizedText; // section title, e.g. "Contáctame"
  subtitle: LocalizedText;
  bg: string; // "transparent" or a hex section background
  allowModeToggle: boolean; // show the person/brand switch
  defaultMode: ContactWidgetMode;
  showContactInfo: boolean; // show the email/phone row in the banner
  contactEmail: string; // mailto shown in the banner
  contactPhone: string; // tel shown in the banner
  person: ContactModeContent;
  brand: ContactModeContent;
  fullHeight?: boolean; // make the section fill 100dvh
};

// Donations / "support me" widget (a dark banner with copyable payment methods).
export type DonationMethod = {
  id: string;
  name: string; // e.g. "Pago Móvil", "PayPal"
  detail: string; // the value to show / copy (account, id, handle)
  color: string; // hex color for the badge
  link: string; // optional URL — when set the action becomes a link, not "copy"
};
export type DonationsConfig = {
  eyebrow: LocalizedText; // small pill, e.g. "Apoya el proyecto"
  heading: LocalizedText;
  text: LocalizedText;
  bg: string; // hex section background (defaults to the dark ink tone)
  fullHeight?: boolean; // make the section fill 100dvh
  methods: DonationMethod[];
};

// Community widget (a wall of approved comments + a submission form).
export type CommunityConfig = {
  eyebrow: LocalizedText;
  heading: LocalizedText;
  subtitle: LocalizedText;
  count: number; // max comments shown on the wall
  showForm: boolean; // show the "leave a comment" form
  formTitle: LocalizedText;
  formSubtitle: LocalizedText;
  emptyText: LocalizedText; // shown when there are no approved comments yet
};

// "Go to top" floating button widget. Always renders fixed (it floats over the
// page), so it is not part of the pinned top stack.
export type GoTopCorner = "bottom-right" | "bottom-left" | "top-right" | "top-left";
export type GoTopConfig = {
  corner: GoTopCorner;
  offset: number; // px from the two edges
  bg: string; // button background (hex)
  iconColor: string; // arrow color (hex)
  showAfter: number; // px scrolled before the button appears
  round: boolean; // fully round vs rounded square
};

// Editor components receive the current config and report changes.
export type WidgetEditorProps<C = Record<string, unknown>> = {
  config: C;
  onChange: (config: C) => void;
};
