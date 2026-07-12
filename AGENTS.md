<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# MiRutaFit — project guide

Personal brand + portal for **MiRutaFit** (a weight-loss / fitness journey).
Marketing homepage, blog, community, donations, and an admin back office.

> This file is the always-loaded overview. Deeper docs live in [`docs/`](docs/).
> **Keep this in sync** whenever something general changes (stack, conventions,
> a new top-level feature, deploy steps).

## Stack

| Concern   | Choice                                                     |
| --------- | ---------------------------------------------------------- |
| Framework | Next.js 16 (App Router) + React 19 + TypeScript            |
| Styling   | Tailwind CSS v4 (config in CSS via `@theme`)               |
| Database  | PostgreSQL 17                                              |
| ORM       | Prisma 7 (`prisma-client` generator + `pg` driver adapter) |
| Auth      | better-auth (email+password, admin plugin)                 |
| i18n      | next-intl 4 (auto-detect, no URL prefix)                   |
| Deploy    | EasyPanel (Docker), domain `mirutafit.com`                 |

## Hard rules

1. **English everywhere in code.** Folder names, files, variables, DB tables and
   columns, env vars — all English. User-facing copy is translated (see i18n).
2. **Recent Next.js / Prisma / better-auth.** APIs differ from older versions —
   check `node_modules/next/dist/docs/` and verify package exports before
   assuming an API. Prisma 7 and next-intl 4 especially.
3. **Base language is English**, Spanish is the only translation for now.

## Run it locally

```bash
docker compose up -d          # Postgres 17 on localhost:5433
npx prisma migrate deploy     # apply migrations
npm run dev                   # app on http://localhost:3000
```

Copy `.env.example` to `.env` first. The owner emails
(`admin@mirutafit.com`, `sluy1283@gmail.com`) are auto-promoted to admin on signup.

## Where things are

- `src/app/` — routes. `(auth)/` = login/register. `admin/` = back office.
- `src/components/` — UI. Marketing homepage sections + shared icons.
- `src/lib/` — `auth.ts` (server), `auth-client.ts` (browser), `prisma.ts`.
- `src/i18n/` — locale detection + config. Messages in `src/messages/`.
- `prisma/` — schema + migrations.
- `docs/` — detailed documentation (read before changing a subsystem).

## Detailed docs

- [Architecture](docs/architecture.md)
- [Database](docs/database.md)
- [Auth & roles](docs/auth.md) — incl. password recovery + verification codes
- [Media & uploads](docs/media.md)
- [Widgets, layouts & pages](docs/widgets.md) — the page builder
- [Articles module](docs/articles.md) — articles, taxonomies, public pages, widget
- [Contact module](docs/contact.md) — contact widget, inbox, notifications
- [Community module](docs/community.md) — comment wall widget + moderation
- [Surveys module](docs/surveys.md) — form builder, public forms, maintenance mode
- [Static pages](docs/static-pages.md) — standalone raw-HTML pages at /static/&lt;slug&gt;
- [Internationalization](docs/i18n.md)
- [Deployment (EasyPanel)](docs/deployment.md)
- [Conventions](docs/conventions.md)
- [Roadmap](docs/roadmap.md)
