# Static Pages module

Standalone HTML pages served **verbatim** at **`/static/<slug>`**, completely
outside the site: no navbar/footer, no root layout, no i18n, no maintenance gate.
The admin pastes raw HTML (or uploads an `.html` file) and it is returned as-is.

Use it to "annex" an existing standalone HTML page/microsite under the domain.

## Data model (`prisma/schema.prisma`)

- **StaticPage** — `slug @unique`, `title` (admin label only, not shown to
  visitors), `html` (raw HTML, stored and served exactly), `published`
  (unpublished → 404), `respectMaintenance` (opt into the maintenance gate).

Server helpers in `src/lib/static-pages.ts`; client-safe types in
`src/lib/static-pages-shared.ts`.

## Public route

`src/app/static/[slug]/route.ts` is a **route handler** (not a page), so the
response never passes through the root layout, i18n or the maintenance gate — it
is a fully standalone document. It looks up the **published** page and returns
`page.html` with `content-type: text/html` + `x-robots-tag: noindex`. Unknown or
unpublished slug → 404. `dynamic = "force-dynamic"` so edits show instantly.

Because it lives under `/static/`, it never collides with real routes.

By default a static page ignores maintenance mode (it's standalone). If its
`respectMaintenance` flag is on and maintenance is enabled, non-admin visitors
get a `503` with a minimal maintenance notice (built inline in the route handler,
matching `MaintenanceScreen`'s look); admins still see the real page.

## Admin

Sidebar link **"Páginas estáticas"** → `/admin/static-pages`:
- **List** — all pages with published/draft status; copy-link, open, delete.
- **Editor** (`/admin/static-pages/[id]`) — title (admin label), slug, a
  published/draft toggle, and a big HTML `<textarea>` with an **"Upload .html
  file"** button that loads a file's contents into the field.

New pages are created as **draft** with a random slug. Actions in
`src/app/admin/static-pages/actions.ts`.
