# Surveys module

Admin-built forms/surveys published at **`/encuestas/<slug>`**, with a public
form and a response inbox in the admin.

## Data model (`prisma/schema.prisma`)

- **Survey** — `slug`, `title`, `description` (intro), `disclaimer` (highlighted
  warning box), `submitText` (thank-you), `status` (`draft` | `open` | `closed`).
- **SurveyQuestion** — `section` (heading it belongs to), `type`, `label`, `help`,
  `required`, `options` (JSON), `order`. Types: `short_text`, `long_text`,
  `single_choice`, `multiple_choice`, `scale`, `number`. `options` holds
  `{ choices[] }` for choice types and `{ min, max, minLabel, maxLabel }` for scale.
- **SurveyResponse** + **SurveyAnswer** — one response per submission, one answer
  per (question). `multiple_choice` answers are stored as a JSON array string.

`saveSurvey` upserts questions by id (preserving ids so existing answers stay
linked) and deletes removed ones. Logic in `src/lib/surveys.ts`; client-safe
types/constants in `src/lib/surveys-shared.ts` (so the editor doesn't pull Prisma
into the browser bundle).

## Admin

Sidebar link **"Encuestas"** → `/admin/surveys`:
- **List** — all surveys with status + question/response counts.
- **Editor** (`/admin/surveys/[id]`) — metadata (slug/status/intro/disclaimer/
  thank-you) + a **question builder** (add/reorder/remove; per-question section,
  type, label, help, required, and type-specific options).
- **Responses** (`/admin/surveys/[id]/responses`) — expandable list of every
  submission with its answers.

## Public

`/encuestas/[slug]` (its own minimal layout, no site navbar) renders **open**
surveys grouped by section, with a styled control per type (pill choices, a 1–N
scale with end labels, etc.), validates required fields, submits via
`submitSurveyAction`, and shows the thank-you message. Drafts/closed → 404.
Marked `noindex`. **Surveys stay reachable in maintenance mode** (see below).

## Maintenance mode

`getMaintenanceSettings()` (`maintenance` setting: `enabled`, `title`, `message`),
edited at **Admin → System → Maintenance**. When enabled, the root layout
(`src/app/layout.tsx`) shows `MaintenanceScreen` to non-admins, except on exempt
paths (`/encuestas`, `/admin`, `/login`, `/register`, `/forgot-password`, `/api`,
`/media`). Admins always see the full site. The pathname reaches the layout via
an `x-pathname` header set in `src/proxy.ts`.
