# Widgets, Layouts & Pages (page builder)

Three concepts:

- **Module** — a feature with its own route(s)/admin (e.g. a future Blog). Lives in
  its own area and can *expose widgets*.
- **Widget** — a registered block type (rich text, slider, …). A configured
  **instance** lives in the Widget library and is reused across layouts.
- **Layout** — how a page is composed: rows → 12-col columns → widget instances.

## Data model

- `Widget { id, type, name, config Json }` — a library instance. `type` maps to
  the registry; `config` shape depends on the type.
- `Page { id, slug @unique, title, layout Json, status }` — `layout` is
  `{ rows: [{ id, columns: [{ id, span (1-12), widgetIds: [] }] }] }`. Home = slug `home`.

## Widget registry (`src/widgets/`)

Adding a widget = 3 small files + 1 entry:

1. `meta.ts` — add `{ type, defaultConfig, singleton? }`. Pure data (server+client safe).
2. `render.tsx` — map `type -> <Render config>` (frontend, can be server or client).
3. `editors.tsx` — map `type -> <Editor config onChange>` (admin, client).
4. Translate its label under `admin.widgets.types.<type>`.

Current widgets:
- **richText** — server render of admin HTML; editor reuses the Tiptap `RichTextEditor`.
- **slider** — Swiper (effects: slide/fade/cube/coverflow/flip, autoplay,
  **full-height / 100dvh** option); editor manages slides (image via
  `MediaPicker`, title/subtitle/button) + options.
- **navbar** _(singleton)_ — config-driven: background color at scroll 0 (incl.
  transparent), text color, show/hide brand, show/hide social bar. Config stored
  in `system_setting` under key `"navbarConfig"`. Social links fed by the
  `socialLinks` setting. Admin editor at `/admin/widgets/navbar`.
- **footer** _(singleton)_ — config-driven: show/hide social links, show/hide
  newsletter section, custom tagline. Config stored under `"footerConfig"`.
  Admin editor at `/admin/widgets/footer`.

Singletons are global chrome: one config per type (not instances in the widget
table), configured in their own admin screen, not placed in the page body
composer. See `isSingletonType()` in `meta.ts`.

## Admin

- **Widgets** — the sidebar shows a "Widgets" group with one sub-item per type
  (`/admin/widgets/<type>`). For non-singleton types (richText, slider), this
  lists/creates instances. For singletons (navbar, footer), it shows a direct
  config editor. Edit instances at `/admin/widgets/<type>/<id>`.
  Actions: `src/app/admin/widgets/actions.ts` (instances),
  `src/app/admin/widgets/singleton-actions.ts` (navbar/footer config).
- **Site → Layout** (`/admin/site/layout`) — drag-and-drop composer (`@dnd-kit`):
  add/remove rows, add/remove columns, set span (1-12), drag widgets from the
  palette into columns, move between columns, reorder/remove, save. Action in
  `src/app/admin/site/layout/actions.ts`.

## Rendering

`src/components/PageRenderer.tsx` walks the layout and renders each widget via the
render registry inside a `grid-cols-12`. The home (`src/app/page.tsx`) renders the
composed layout when it has rows; otherwise it falls back to the original
hard-coded sections (gradual migration). Helpers in `src/lib/pages.ts`.

Navbar and Footer are rendered by the page shell (not the composer). Their config
is loaded via `getNavbarConfig()` / `getFooterConfig()` in `src/lib/settings.ts`.

## Roadmap (next)

- **More slider types** — a richer "showcase" slider (creative effects, per-slide
  text animation/positioning, overlays).
- Bind text fields to translation keys (i18n) inside widget editors.
- More widgets: sponsors, posts/blog-list.
- Per-breakpoint spans (responsive), draft/publish + revisions, multiple pages.
- Within-column drag reordering (currently up/down buttons).

