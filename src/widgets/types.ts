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
export type RichTextConfig = { html: string };

export type SliderEffect = "slide" | "fade" | "cube" | "coverflow" | "flip";
export type SliderSlide = {
  id: string;
  image: string | null; // media library fileName
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
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

// Navbar (singleton chrome widget).
export type NavbarConfig = {
  enabled: boolean; // render the navbar at all
  topBg: string; // "transparent" or a hex color (background at scroll 0)
  topText: string; // hex text color at scroll 0
  showBrand: boolean;
  // Top social bar — its own separate bar above the navbar.
  showSocialBar: boolean;
  socialBg: string; // hex background of the social bar
  socialText: string; // hex text/icon color of the social bar
  socialAlign: SocialAlign; // where the social buttons sit
};

// Footer (singleton chrome widget).
export type FooterConfig = {
  enabled: boolean;
  showSocial: boolean;
  showNewsletter: boolean;
  tagline: string;
};

// Editor components receive the current config and report changes.
export type WidgetEditorProps<C = Record<string, unknown>> = {
  config: C;
  onChange: (config: C) => void;
};
