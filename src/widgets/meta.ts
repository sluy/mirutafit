import type {
  RichTextConfig,
  SliderConfig,
  NavbarConfig,
  SocialBarConfig,
  FooterConfig,
  ArticlesConfig,
  ContactConfig,
  DonationsConfig,
  CommunityConfig,
  GoTopConfig,
  MacroCalcConfig,
} from "./types";

/**
 * Registry metadata — pure data, safe to import on server or client.
 * Components (Render / Editor) live in separate files to keep bundles clean.
 *
 * To add a widget: add an entry here, a Render in `render.tsx`, and an Editor
 * in `editors.tsx`. Labels/descriptions are translated under `admin.widgets.types`.
 *
 * Every widget is placed in a page layout to appear — there are no singletons
 * and no per-widget "enabled" flag.
 */
export type WidgetTypeKey =
  | "richText"
  | "slider"
  | "navbar"
  | "socialBar"
  | "footer"
  | "articles"
  | "contact"
  | "donations"
  | "community"
  | "goTop"
  | "macroCalc";

export type WidgetMeta = {
  type: WidgetTypeKey;
  defaultConfig: Record<string, unknown>;
};


const richTextDefault: RichTextConfig = {
  html: "<p></p>",
  heightMode: "auto",
  height: 400,
  bg: "transparent",
};

const sliderDefault: SliderConfig = {
  effect: "slide",
  autoplay: true,
  interval: 4500,
  height: 480,
  fullHeight: false,
  slides: [],
};

const navbarDefault: NavbarConfig = {
  topBg: "transparent",
  topText: "#ffffff",
  scrolledBg: "#ffffff",
  scrolledText: "#0a1410",
  showBrand: true,
  brandZone: "left",
  fixed: true,
  menuCategories: [],
  items: [
    { id: "i_home", type: "home", zone: "left", style: "text", label: "", url: "", widgetId: "" },
    { id: "i_cats", type: "categories", zone: "center", style: "text", label: "", url: "", widgetId: "" },
    { id: "i_auth", type: "auth", zone: "right", style: "text", label: "", url: "", widgetId: "" },
    { id: "i_support", type: "support", zone: "right", style: "button", label: "", url: "#apoyo", widgetId: "" },
  ],
};

const socialBarDefault: SocialBarConfig = {
  bg: "#0a1410",
  text: "#ffffff",
  hover: "#16c47f", // brand
  align: "right",
  fixed: false,
};

const footerDefault: FooterConfig = {
  showSocial: true,
  showNewsletter: true,
  tagline: "Mi ruta hacia una vida más sana. 🌱",
  newsletterTitle: "Recibe novedades",
  newsletterText: "Rutinas, recetas y motivación directo a tu correo. Sin spam.",
  copyright: "Todos los derechos reservados.",
  madeWith: "Hecho con 💚 en Venezuela",
  columns: [
    {
      id: "c_nav",
      title: "Navega",
      links: [
        { id: "l_home", type: "link", label: "Inicio", url: "/", widgetId: "" },
        { id: "l_blog", type: "link", label: "Blog", url: "/articles", widgetId: "" },
        { id: "l_comm", type: "link", label: "Comunidad", url: "#comunidad", widgetId: "" },
      ],
    },
    {
      id: "c_res",
      title: "Recursos",
      links: [
        { id: "l_support", type: "link", label: "Apóyame", url: "#apoyo", widgetId: "" },
        { id: "l_contact", type: "link", label: "Contacto", url: "#contacto", widgetId: "" },
        { id: "l_login", type: "link", label: "Iniciar sesión", url: "/login", widgetId: "" },
      ],
    },
  ],
};

const articlesDefault: ArticlesConfig = {
  heading: "",
  mode: "latest",
  count: 3,
  categoryKey: null,
  articleIds: [],
  columns: 3,
  showViewAll: true,
};

const contactDefault: ContactConfig = {
  eyebrow: "Hablemos",
  heading: "Contáctame",
  subtitle:
    "¿Eres una persona que quiere empezar o una marca que quiere colaborar? Elige una opción.",
  bg: "#f9fafb",
  allowModeToggle: true,
  defaultMode: "person",
  showContactInfo: true,
  contactEmail: "hola@mirutafit.com",
  contactPhone: "+58 000 000 0000",
  person: {
    toggleLabel: "Soy una persona",
    badge: "Para ti 💪",
    bannerTitle: "¿Listo para empezar tu ruta?",
    bannerText:
      "Escríbeme y te respondo personalmente. No importa en qué punto estés, siempre hay un primer paso.",
    points: [
      "Respuesta directa y cercana",
      "Sin compromiso ni venta agresiva",
      "Te oriento según tu objetivo",
    ],
    topics: [
      "Quiero empezar y no sé cómo",
      "Dudas sobre entrenamiento",
      "Dudas sobre alimentación",
      "Solo quiero saludar",
      "Otro",
    ],
    placeholder: "Cuéntame en qué punto estás y en qué te puedo ayudar...",
  },
  brand: {
    toggleLabel: "Soy una marca",
    badge: "Para marcas 🤝",
    bannerTitle: "Hagamos algo grande juntos",
    bannerText:
      "Si tu marca comparte los valores de salud real y constancia, conversemos. Cuéntame tu propuesta.",
    points: [
      "Audiencia comprometida y real",
      "Contenido auténtico, no forzado",
      "Reportes y métricas de campaña",
    ],
    topics: [
      "Propuesta de colaboración",
      "Patrocinio / sponsorship",
      "Publicidad y contenido",
      "Embajador de marca",
      "Otro (negocios)",
    ],
    placeholder: "Cuéntame sobre tu marca y la propuesta de colaboración...",
  },
};

const donationsDefault: DonationsConfig = {
  eyebrow: "Apoya el proyecto",
  heading: "Si algo de lo que comparto te ha ayudado, puedes invitarme un café",
  text: "Todo este contenido es gratuito. Tu aporte —del tamaño que sea— me ayuda a seguir creando rutinas, recetas y artículos para la comunidad. ¡Gracias de corazón! 💚",
  bg: "#0a1410",
  methods: [
    { id: "m1", name: "Pago Móvil", detail: "Banesco · 0414-0000000", color: "#10b981", link: "" },
    { id: "m2", name: "Binance Pay", detail: "ID: 123456789", color: "#fbbf24", link: "" },
    { id: "m3", name: "PayPal", detail: "paypal.me/mirutafit", color: "#0ea5e9", link: "https://paypal.me/mirutafit" },
  ],
};

const communityDefault: CommunityConfig = {
  eyebrow: "La comunidad",
  heading: "Lo que dice la gente que ya empezó",
  subtitle: "Déjame tu mensaje. Leo todos y me motivan a seguir compartiendo.",
  count: 8,
  showForm: true,
  formTitle: "Deja tu comentario",
  formSubtitle: "Cuéntanos cómo vas o qué te gustaría ver.",
  emptyText: "Sé el primero en dejar un mensaje. 💚",
};

const goTopDefault: GoTopConfig = {
  corner: "bottom-right",
  offset: 24,
  bg: "#16c47f",
  iconColor: "#ffffff",
  showAfter: 300,
  round: true,
};

const macroCalcDefault: MacroCalcConfig = {
  eyebrow: "Calculadora Interactiva",
  heading: "Calculadora de Metabolismo Basal",
  subtitle: "Conoce tu gasto energético diario, rango de peso saludable y los tipos de déficit calórico recomendados.",
  bg: "#0a1410",
  accentColor: "#16c47f",
  displayMode: "panel",
  fullHeight: false,
  floatingPosition: "bottom-right",
  showGuideLink: true,
  guideLinkText: "Ver Guía Completa de Macronutrientes 📖",
  defaultSex: "male",
  defaultAge: 28,
  defaultHeight: 175,
  defaultWeight: 80,
  defaultActivity: "moderate",
};

export const WIDGET_META: Record<WidgetTypeKey, WidgetMeta> = {
  richText: { type: "richText", defaultConfig: richTextDefault },
  slider: { type: "slider", defaultConfig: sliderDefault },
  navbar: { type: "navbar", defaultConfig: navbarDefault },
  socialBar: { type: "socialBar", defaultConfig: socialBarDefault },
  footer: { type: "footer", defaultConfig: footerDefault },
  articles: { type: "articles", defaultConfig: articlesDefault },
  contact: { type: "contact", defaultConfig: contactDefault },
  donations: { type: "donations", defaultConfig: donationsDefault },
  community: { type: "community", defaultConfig: communityDefault },
  goTop: { type: "goTop", defaultConfig: goTopDefault },
  macroCalc: { type: "macroCalc", defaultConfig: macroCalcDefault },
};

export const WIDGET_TYPE_KEYS = Object.keys(WIDGET_META) as WidgetTypeKey[];

/** All widgets are placeable in the layout. */
export const PLACEABLE_WIDGET_TYPES = WIDGET_TYPE_KEYS;

export function isWidgetType(value: string): value is WidgetTypeKey {
  return value in WIDGET_META;
}
