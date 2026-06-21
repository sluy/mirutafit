import type {
  RichTextConfig,
  SliderConfig,
  NavbarConfig,
  FooterConfig,
} from "./types";

/**
 * Registry metadata — pure data, safe to import on server or client.
 * Components (Render / Editor) live in separate files to keep bundles clean.
 *
 * To add a widget: add an entry here, a Render in `render.tsx`, and an Editor
 * in `editors.tsx`. Labels/descriptions are translated under `admin.widgets.types`.
 */
export type WidgetTypeKey = "richText" | "slider" | "navbar" | "footer";

export type WidgetMeta = {
  type: WidgetTypeKey;
  defaultConfig: Record<string, unknown>;
  // Singletons are global "chrome" (navbar/footer): one instance, configured in
  // its own screen, NOT placed in the page body composer.
  singleton?: boolean;
};

const richTextDefault: RichTextConfig = { html: "<p></p>" };

const sliderDefault: SliderConfig = {
  effect: "slide",
  autoplay: true,
  interval: 4500,
  height: 480,
  fullHeight: false,
  slides: [],
};

const navbarDefault: NavbarConfig = {
  enabled: true,
  topBg: "transparent",
  topText: "#ffffff",
  showBrand: true,
  showSocialBar: true,
  socialBg: "#0a1410",
  socialText: "#ffffff",
  socialAlign: "right",
};

const footerDefault: FooterConfig = {
  enabled: true,
  showSocial: true,
  showNewsletter: true,
  tagline: "Mi ruta hacia una vida más sana. 🌱",
};

export const WIDGET_META: Record<WidgetTypeKey, WidgetMeta> = {
  richText: { type: "richText", defaultConfig: richTextDefault },
  slider: { type: "slider", defaultConfig: sliderDefault },
  navbar: { type: "navbar", defaultConfig: navbarDefault, singleton: true },
  footer: { type: "footer", defaultConfig: footerDefault, singleton: true },
};

export const WIDGET_TYPE_KEYS = Object.keys(WIDGET_META) as WidgetTypeKey[];

/** Types that can be placed in the page body (excludes chrome singletons). */
export const PLACEABLE_WIDGET_TYPES = WIDGET_TYPE_KEYS.filter(
  (k) => !WIDGET_META[k].singleton,
);
export function isSingletonType(type: string): boolean {
  return type in WIDGET_META && !!WIDGET_META[type as WidgetTypeKey].singleton;
}

export function isWidgetType(value: string): value is WidgetTypeKey {
  return value in WIDGET_META;
}
