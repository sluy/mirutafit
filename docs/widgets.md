# Widgets, Layouts & Pages (page builder)

The public site is a **page builder**. A page is composed from **widgets** placed
in a **layout**. There is no global "chrome" and no per-widget on/off flag: a
widget appears **iff it is placed in the layout**. Navbar, social bar and footer
are widgets like any other.

Three concepts:

- **Module** — a feature with its own route(s)/admin (e.g. a future Blog). Lives
  in its own area and can _expose widgets_.
- **Widget** — a registered block type (rich text, slider, navbar, …). A
  configured **instance** lives in the Widget library and can be reused across
  layouts.
- **Layout** — how a page is composed: rows → 12-col columns → widget instances.

## Data model (`prisma/schema.prisma`)

- `Widget { id, type, name, config Json }` — a library instance. `type` maps to
  the registry; the `config` shape depends on the type. Stored raw — widgets must
  tolerate missing fields (default them in the Render/Editor).
- `Page { id, slug @unique, title, layout Json, status }` — `layout` is
  `{ rows: [{ id, columns: [{ id, span (1-12), widgetIds: string[] }] }] }`.
  The home page has slug `home`. Helpers in `src/lib/pages.ts`.

## Registry (`src/widgets/`)

Everything about a widget type is split so server/client bundles stay clean:

| File | Role | Env |
| --- | --- | --- |
| `types.ts` | Config TypeScript types | shared |
| `meta.ts` | `WIDGET_META`: `{ type, defaultConfig }` per type (pure data) | shared |
| `render.tsx` | `WIDGET_RENDER`: `type -> <Render config>` (frontend) | server-imported |
| `editors.tsx` | `WIDGET_EDITORS`: `type -> <Editor config onChange>` (admin) | client |

`WIDGET_TYPE_KEYS` / `PLACEABLE_WIDGET_TYPES` (all types are placeable) drive the
admin. The sidebar lists one sub-item per type automatically.

### To add a widget type

1. **types.ts** — add a `XConfig` type.
2. **meta.ts** — add `WidgetTypeKey` + a `WIDGET_META.x = { type, defaultConfig }`.
3. Create `src/widgets/x/XWidget.tsx` (Render — server _or_ client; can be an
   `async` server component to load data) and `XWidgetEditor.tsx` (client,
   `WidgetEditorProps<XConfig>`).
4. **render.tsx** + **editors.tsx** — register them.
5. **messages** — `admin.widgets.types.x` (label) + an `admin.widgets.x.*`
   namespace for the editor's strings, in **both** `en.json` and `es.json`.

A Render that needs server-only data (DB) is an `async` server component — e.g.
`SocialBarWidget`/`FooterWidget` call `getSocialLinks()`. PageRenderer awaits it.

## Current widgets

- **richText** — renders admin-authored HTML (Tiptap). Config:
  `{ html, heightMode: "auto"|"fixed"|"full", height, bg }`. `auto` = fits content
  (min height = content); `fixed` = `height` px with vertical scroll; `full` =
  `100dvh` with scroll. `bg` is `"transparent"` or a hex color.
- **slider** — Swiper. Config: `{ effect (slide/fade/cube/coverflow/flip/shatter),
  autoplay, interval, height, fullHeight, slides[] }`. `fullHeight` = `100dvh`.
  Slides: `{ image (media fileName), imagePosition (center/top/bottom/left/right),
  content (rich HTML, LocalizedText), overlayColor (hex), overlayOpacity (0-100),
  mobileEnabled, mobileImage, mobileContent }`. `content` is authored via the
  Tiptap rich-text editor (same as richText widget) and supports raw HTML source
  editing. Legacy slides with `title`/`subtitle`/`buttonText`/`buttonLink` are
  migrated on read (composed into HTML automatically). The overlay color+opacity
  control what was previously the hardcoded `bg-black/35`. When `mobileEnabled`
  is true, the slide renders two CSS layers (`hidden sm:block` / `block sm:hidden`)
  with separate image and content for small viewports.
- **navbar** — composable bar. Colors (`topBg`/`topText` at scroll 0,
  `scrolledBg`/`scrolledText` once scrolled), `showBrand` + `brandZone`, `fixed`,
  `menuCategories[]`, and **`items[]`** — the builder. Each item has a `zone`
  (`left`/`center`/`right`), `style` (`text`/`button`) and `type`: `home`, `auth`
  (login/session), `support` (CTA), `categories` (expands `menuCategories`),
  `language` (the language switcher, shown only with >1 enabled locale),
  `link` (manual URL/anchor) or `widget` (anchor to a placed widget's
  `#w-<id>` section, with a custom label or the widget's name). The `NavbarWidget`
  server wrapper resolves items → labels/hrefs for the client `Navbar`. **Legacy
  navbars** (no `items`) keep the old `menuCategories`/anchor rendering. The editor
  arranges items across the three zones with drag & drop (`@dnd-kit`).
  Widget anchors come from `PageRenderer`, which wraps each placed widget in
  `<div id="w-<id>">`.
- **socialBar** — a standalone bar of social icons (from the `socialLinks`
  setting). `{ bg, text, hover (default brand), align (left/center/right),
  fixed }`. Hover color via the `.social-hover` CSS rule + `--social-hover` var.
- **footer** — configurable footer. `{ showSocial, showNewsletter, tagline,
  newsletterTitle, newsletterText, copyright, madeWith, columns[] }`; each column
  is `{ id, title, links[] }` and each link `{ id, type (link|widget), label, url,
  widgetId }` (a `widget` link scrolls to `#w-<id>`). All text is `LocalizedText`.
  Server component; uses `socialLinks` + `SmoothLink` for anchors. Footers saved
  before the builder (no `columns`) fall back to translated `footer.*` defaults.
- **articles** — a card grid from the Articles module (see [articles.md](articles.md)).
  `{ heading, mode (latest/first/manual), count, categoryKey, articleIds[],
  columns, showViewAll }`. Server component (queries the DB).
- **contact** — a configurable banner + form with two modes (see [contact.md](contact.md)).
  Submits to a public server action (saves a `ContactMessage` + best-effort email).
- **donations** — a "support me" dark banner with copyable payment methods.
  `{ eyebrow, heading, text, bg, methods[] }`; each method is
  `{ id, name, detail, color, link }` — a `link` turns "Copy" into a "Donate"
  link. Client component (clipboard copy).
- **community** — a wall of **approved** comments + a submission form (see
  [community.md](community.md)). `{ eyebrow, heading, subtitle, count, showForm,
  formTitle, formSubtitle, emptyText }`. Server component; the form posts to a
  public action (honeypot) and comments are moderated in the admin.
- **goTop** — a floating "scroll to top" button. `{ corner (top/bottom +
  left/right), offset, bg, iconColor, showAfter (px), round }`. Client component;
  renders `position: fixed` itself (not part of the pinned top stack), appears
  once scrolled past `showAfter`.
- **macroCalc** — interactive metabolism, composition & health calculator. `{ eyebrow,
  heading, subtitle, bg, accentColor, displayMode ("panel"|"floating"), fullHeight,
  floatingPosition ("top-left"|"top-right"|"bottom-left"|"bottom-right"|"top-center"|"bottom-center"),
  showGuideLink, guideLinkText, defaultSex, defaultAge, defaultHeight, defaultWeight, defaultActivity }`.
  Calculates BMR (Mifflin-St Jeor), TDEE, BMI, healthy weight range, BMI status avatar,
  caloric deficit levels, and macro breakdown. Links to `/static/guia-macros`.


## Fixed / pinned widgets (important)

A widget config may have `fixed: boolean` (navbar, socialBar). **The widget
components never position themselves** — `PageRenderer` collects every widget with
`config.fixed === true` (in document order) and renders them in a **single**
`position: fixed; top: 0` stack, so multiple pinned bars stack neatly instead of
overlapping. Non-fixed widgets flow in the 12-col grid. See `isFixed()` in
`src/components/PageRenderer.tsx`. Order in the stack = order in the layout.

## Admin

- **Widgets** group (sidebar) → one page per type at `/admin/widgets/<type>`:
  lists/creates instances of that type. Edit at `/admin/widgets/<type>/<id>`
  (`WidgetEditorScreen` renders the type's Editor). Actions in
  `src/app/admin/widgets/actions.ts`.
- **Site → Layout** (`/admin/site/layout`) — `@dnd-kit` composer
  (`LayoutComposer`): add/remove rows, add/remove columns, set span (1-12), drag
  widgets from the palette into columns, move/reorder/remove, save. Action in
  `src/app/admin/site/layout/actions.ts`. Only `home` is editable today.

## Rendering

`src/components/PageRenderer.tsx` walks the layout: pinned (`fixed`) widgets go in
the top stack, the rest render in their grid columns. The home
(`src/app/page.tsx`) renders the composed layout when it has rows; otherwise it
falls back to the original hard-coded sections with a default navbar/footer
(gradual migration). Unknown/orphan widget ids render nothing.

## Conventions

- Configs are stored raw JSON — **default missing fields** in Render/Editor
  (`config.x ?? default`) so old instances keep working when a config grows.
- Colors are hex (or `"transparent"`); apply them via inline `style`, not Tailwind
  classes (dynamic values aren't in the safelist).
- Editors are client components taking `WidgetEditorProps<C>` and calling
  `onChange({ ...config, ...patch })`.

## Roadmap (next)

- A richer "showcase" slider (creative effects, per-slide animation/positioning).
- Bind widget text fields to translation keys (i18n) in the editors.
- More widgets: sponsors, posts/blog-list.
- Per-breakpoint spans (responsive), draft/publish + revisions, multiple pages.
- Within-column drag reordering (currently up/down buttons).
