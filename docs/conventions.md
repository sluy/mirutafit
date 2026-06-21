# Conventions

## Language

- **All code identifiers in English**: folders, files, components, variables,
  functions, DB tables/columns, env vars. No Spanish in code.
- **User-facing text is translated** via next-intl. English is the base; Spanish
  is the translation. New strings go into both `src/messages/en.json` and
  `src/messages/es.json`.

## Files & structure

- Components: `PascalCase.tsx` in `src/components/`. One component per file for
  the larger sections.
- Route folders are lowercase. Route groups like `(auth)` don't affect the URL.
- Server-only helpers go in `src/lib/`. Anything importing `auth-client` or using
  hooks/state must start with `"use client"`.

## Styling

- Tailwind v4. Theme tokens (brand colors, fonts) are defined in
  `src/app/globals.css` under `@theme` — change colors there, not inline.
- Brand color is `brand` (use `bg-brand`, `text-brand`, …). Dark surfaces use
  `ink`.

## Database changes

- Edit `prisma/schema.prisma`, then `npx prisma migrate dev --name <change>`.
- Never edit applied migration files. Keep auth model field names unchanged.
- Document new models in `docs/database.md`.

## Auth

- Read sessions server-side with `auth.api.getSession({ headers })`.
- Don't trust the client for authorization — gate admin routes server-side.

## User feedback (system-wide)

Every action must tell the user what happened:

- **Toasts** via `sonner`: `import { toast } from "sonner"` →
  `toast.success(...)` / `toast.error(...)`. The `<Toaster>` is mounted in the
  root layout. Translate the messages.
- **Form validation**: use `Field` + `inputClass` from
  `src/components/ui/Field.tsx`. Failing fields render red with helper text;
  validate before submit and clear a field's error on change.
- **Passwords**: always use `PasswordInput` from
  `src/components/ui/PasswordInput.tsx` (it has the show/hide eye toggle). Never
  a bare `<input type="password">`.
- **Loading**: add a `loading.tsx` to a route segment for its preloader; the
  global `TopLoader` shows a progress bar on link navigations. Spinners come
  from `src/components/ui/Spinner.tsx`.

## Keep docs current

When a general thing changes (stack, a new top-level feature, deploy steps,
conventions), update `AGENTS.md` and the relevant file in `docs/`.
