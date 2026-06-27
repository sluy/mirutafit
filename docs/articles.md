# Articles module (design spec)

The **Articles** module ("Artículos" — more specific than "Blog") lets admins
publish documents, recipes, etc. with a powerful Word-like editor, per-language
content, shared taxonomies (categories & tags), public listing + detail pages,
SEO, and an injectable **Articles widget** for the page builder.

> Status: **built** (all six phases). Implementation was phased (see end) so we
> could pause and resume. This doc now also serves as the reference for the
> shipped module — keep it in sync with code changes.

## 1. Goals / decisions

- **Name:** "Artículos" everywhere (route `/articles`, admin "Artículos").
- **Per-language content:** one `Article` entity with one **translation per
  locale** (EN default + ES). Shared across locales: cover image, taxonomies,
  dates, status. Per-locale: title, slug, short description, body.
- **Taxonomies live OUTSIDE articles** (own admin area) so other features can
  reuse them. Stored as `snake_case` keys with **per-locale labels**.
- **Editor:** reuse/extend **Tiptap** into a full `ArticleEditor` (toolbar like
  Word) that inserts images/videos **from the Media library** (MediaPicker).
- **Slug/URL:** auto from title, editable; article lives at
  `/articles/<YYYY-MM-DD>/<slug>` (date from `publishedAt`).
- **SEO:** cover image + title + description drive `<title>`/OG tags automatically.

## 2. Data model (Prisma)

```prisma
model Article {
  id          String    @id @default(cuid())
  coverImage  String?   // media fileName (used by widget + SEO og:image)
  status      String    @default("draft") // "draft" | "published"
  publishedAt DateTime? // drives the YYYY-MM-DD url segment + ordering
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  translations ArticleTranslation[]
  categories   Category[] @relation("ArticleCategories")
  tags         Tag[]      @relation("ArticleTags")
}

model ArticleTranslation {
  id          String   @id @default(cuid())
  articleId   String
  article     Article  @relation(fields: [articleId], references: [id], onDelete: Cascade)
  locale      String   // "en" | "es"
  title       String
  slug        String
  description String   @default("") // short excerpt
  body        String   @default("") // rich HTML from the editor
  updatedAt   DateTime @updatedAt

  @@unique([articleId, locale])
  @@unique([locale, slug])   // slug unique per language
}

// Taxonomy term — shared, reusable. Same shape for Tag.
model Category {
  id        String   @id @default(cuid())
  key       String   @unique // snake_case, e.g. "recetas_saludables"
  createdAt DateTime @default(now())
  translations CategoryTranslation[]
  articles  Article[] @relation("ArticleCategories")
}
model CategoryTranslation {
  id         String   @id @default(cuid())
  categoryId String
  category   Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  locale     String
  label      String   // human label per locale, e.g. "Recetas saludables"
  @@unique([categoryId, locale])
}
// model Tag { ... }  +  model TagTranslation { ... }  // identical to Category
```

Notes:
- **Taxonomy translation strategy:** a `*Translation` table per term (NOT the
  app's message JSON), because terms are admin-created/dynamic. `key` is the
  stable id (snake_case); `label` is what users see, per locale. Missing label →
  fall back to default-locale label, then to the `key`.
- A translation without a value for the current locale → the article falls back
  to the default-locale translation (or is hidden if even that is missing).

## 3. Taxonomies (categories & tags) — admin area

Separate from articles, so they're reusable. Admin pages:
- `/admin/content/categories` — list, create (enter a label → auto `snake_case`
  key, editable), edit per-locale labels, delete.
- `/admin/content/tags` — same.

Sidebar: a **"Contenido"** group → `Artículos`, `Categorías`, `Tags`.

Helpers (`src/lib/taxonomy.ts`): `listCategories(locale)`, `getCategoryLabel`,
create/update/delete, slugify-to-key. Same for tags.

## 4. The editor (`ArticleEditor`)

Extend Tiptap (already in the project) into a Word-like editor. Target toolbar:
headings, bold/italic/underline/strike, text color & highlight, font size,
alignment, ordered/bullet lists, blockquote, code block, horizontal rule, link,
**table**, **image**, **video/embed**, undo/redo, clear formatting.

Extensions: `@tiptap/starter-kit` + `extension-underline`, `-text-align`,
`-color`, `-highlight`, `-table*`, `-image`, plus a small custom **video node**.

**Media integration (key):** custom toolbar buttons "Insert image" / "Insert
video" open the existing **`MediaPicker`** (accept image/video). On select, insert
a node referencing `/media/<fileName>`. No new upload path — everything comes from
the Media library. (Output: HTML stored in `ArticleTranslation.body`.)

> Alternative if we want maximum out-of-box "Word" feel: **CKEditor 5** (GPL).
> Trade-off: heavier + its own upload adapter (more work to wire to MediaPicker).
> Recommendation: **Tiptap extended** for tighter media integration and no new
> licensing.

## 5. Slugs & URLs

- `slug` auto-generated from `title` (slugify: lowercase, dashes, strip accents),
  editable, unique per locale.
- Public URL: **`/articles/<YYYY-MM-DD>/<slug>`** where the date = `publishedAt`.
- Route `src/app/articles/[date]/[slug]/page.tsx`: resolve the
  `ArticleTranslation` by `(locale, slug)` for the request locale; fall back to the
  default locale; 404 if none / not published. `generateMetadata` builds SEO from
  title/description/coverImage.

## 6. Articles widget (page builder)

A new registry widget `articles` (see [widgets](widgets.md)). Server-render
component that queries articles.

Config:
```ts
type ArticlesWidgetConfig = {
  heading: string;        // default "Artículos"
  mode: "latest" | "first" | "manual";
  count: number;          // how many to show (ignored for manual = articleIds.length)
  categoryKey: string | null; // optional filter for latest/first
  articleIds: string[];   // ordered, for mode "manual"
  columns: number;        // grid columns (e.g. 3)
  showViewAll: boolean;   // show the "Ver todos" link
};
```

Auto subtitle by mode (translatable):
- `latest` → "Los más recientes"
- `first` → "Los primeros"
- `manual` → "Los mejores"

Visual: heading (big) + subtitle, then a card grid — cover image, title, short
description, date — and a **"Ver todos →"** link to `/articles`. Each card links to
its article. Looks like the other section components (brand styling).

## 7. Public listing — `/articles`

Lists **published** articles for the current locale with filters:
- search by **title**, filter by **category**, filter by **tags** (multi),
  ordering (newest/oldest). Pagination.
Each result = the same card style. Filters via query params
(`?q=&category=&tag=&page=`). Server-rendered for SEO.

## 8. Navbar → dynamic category menu

Add to `NavbarConfig`: `menuCategories: string[]` (ordered category keys). The
navbar renders these as menu links (label = category label in the current locale)
pointing to `/articles?category=<key>`. This replaces today's hard-coded nav
links and makes the menu dynamic. Editor: a multi-select of existing categories
(reorderable). (Open: also allow static custom links alongside — later.)

## 9. i18n

- Article body/title/etc.: per-locale rows (section 2). Default locale is the
  canonical fallback.
- Taxonomy labels: per-locale rows (section 2).
- All admin/UI chrome strings: the existing next-intl system
  (`admin.articles.*`, `admin.taxonomy.*`, `widgets.articles.*`).

## 10. Admin structure (sidebar)

New **"Contenido"** group:
- **Artículos** (`/admin/content/articles`) — list (title, status, date,
  categories) + filters; create/edit screen with a **language switcher** (EN/ES),
  cover image (MediaPicker), title, slug (auto/editable), short description,
  category & tag multi-selects, status (draft/published), publish date, and the
  `ArticleEditor` for the body.
- **Categorías** (`/admin/content/categories`).
- **Tags** (`/admin/content/tags`).

## 11. Implementation phases (all shipped ✅)

1. ✅ **Taxonomies** — single `Taxonomy`/`TaxonomyTranslation` pair (`kind` =
   `category` | `tag`) + migration; `src/lib/taxonomy.ts`; admin CRUD pages with
   per-locale labels.
2. ✅ **Articles core** — `Article`/`ArticleTranslation` models + migration; admin
   list + create/edit screen (`ArticleEditorScreen`: language tabs, cover via
   MediaPicker, slug, taxonomies, status, publishedAt).
3. ✅ **ArticleEditor full** — `src/components/admin/content/ArticleEditor.tsx`:
   Tiptap toolbar (headings, marks, color/highlight, font size, alignment, lists,
   blockquote, code block, rule, link, **table**, **image**, **video**) with
   MediaPicker inserts + a custom `Video` node (`tiptapVideo.ts`, media file or
   YouTube/Vimeo embed).
4. ✅ **Public pages** — `/articles` listing (search + category + tags + ordering +
   pagination, all via query params) and `/articles/[date]/[slug]` detail with
   `generateMetadata` SEO. Chrome in `src/app/articles/layout.tsx` (in-flow navbar
   + footer). Cards: `src/components/articles/ArticleCard.tsx` (shared w/ widget).
5. ✅ **Articles widget** — registry key `articles` (`src/widgets/articles/*`):
   modes latest/first/manual, count, category filter, manual picker, columns,
   view-all. Editor loads options via `listArticleOptionsAction` /
   `listTaxonomyOptionsAction` (`src/app/admin/content/actions.ts`).
6. ✅ **Navbar dynamic categories** — `menuCategories` on `NavbarConfig` +
   multi-select in `NavbarWidgetEditor`. Server wrapper `NavbarWidget` resolves
   keys → labels via `getMenuCategories`; the client `Navbar` renders them (falls
   back to the default anchor links when none are configured).

> **Note:** taxonomy is modeled as one `Taxonomy` table discriminated by `kind`
> (not separate `Category`/`Tag` tables as sketched in §2); labels/links resolve
> with the locale→default→key fallback. Public pages return HTTP 200 with a
> `noindex` meta for missing articles (Next 16 streaming behavior), not a hard 404.

## 12. Open decisions (to confirm)

- Editor: **Tiptap extended** (recommended) vs CKEditor 5.
- Article **type/template** (e.g. "recipe" with structured fields like
  ingredients/steps) — out of scope v1; the rich body covers it. Add a `type`
  field later if we want recipe-specific layouts.
- Navbar menu: categories only, or categories + custom static links.
- Listing pagination size; whether tags filter is AND/OR.
- Do we want **scheduled publishing** (publishedAt in the future) now or later.
