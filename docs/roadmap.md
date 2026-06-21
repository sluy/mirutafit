# Roadmap

Tracks what's done and what's next. Update as milestones land.

## Done

- [x] Project scaffold: Next.js 16 + TS + Tailwind v4.
- [x] Marketing homepage (navbar w/ scroll reveal, hero, sponsors, about, blog,
      community, donations, contact w/ person/brand modes, footer).
- [x] PostgreSQL 17 via Docker for local dev (`docker-compose.yml`, port 5433).
- [x] Prisma 7 + `pg` driver adapter.
- [x] Auth (better-auth): email + password, sessions.
- [x] Roles + ban (admin plugin). Forced admins via `ADMIN_EMAILS`.
- [x] Optional profile fields (firstName, lastName, country, phone).
- [x] Login / register pages.
- [x] i18n infra (next-intl, auto-detect EN/ES, no URL prefix).
- [x] Admin back office: route guard, dashboard, user management
      (role + ban/unban), system settings → SMTP form (persisted).
- [x] EasyPanel-ready Docker image (standalone + auto `migrate deploy`).
- [x] UX feedback system: toasts (`sonner`), inline form validation with red
      fields (`components/ui/Field`), top progress bar + `loading.tsx` preloaders.
- [x] Session-aware navbar (Google-style avatar menu) that stays pinned on scroll.
- [x] Account area: editable profile (`/account`) + change password
      (`/account/security`).
- [x] Route protection via proxy (clean 307 redirects for /admin & /account).
- [x] Nested admin nav (Users → List / Settings, System → Email). Password
      fields have a show/hide toggle everywhere.
- [x] Toggle to enable/disable public registration (enforced in signup; owners
      always allowed; /register shows a closed notice).

- [x] Email sending (nodemailer) via saved SMTP, with a "test email" dialog.
- [x] Reusable verification-code module (`src/lib/verification-codes.ts`) +
      admin-configurable policy (length, charset, expiry, attempts).
- [x] Password recovery: email → code → new password (`/forgot-password`).
- [x] Reusable global `Dialog` (`src/components/ui/Dialog.tsx`); password fields
      have a show/hide eye.
- [x] **Media library** (`/admin/media`): upload (uuid+ext), folders, Drive-style
      grid with thumbnails + video hover preview, rename, public/private,
      image rotate/flip, delete. Served at `/media/<file>` with privacy. Reusable
      `MediaPicker`. User avatars upload to `/uploads`. See [media](media.md).

- [x] **Admin language editor** (`/admin/system/languages`) — edit translations
      live; DB overrides merge over the base `messages/*.json`.
- [x] **Media editors**: interactive image crop (react-image-crop + sharp),
      reusable WYSIWYG (`RichTextEditor`, Tiptap) for html, text editor for
      text/json/svg.

## Next

- [ ] **Static video thumbnails** (ffmpeg) + HTTP range requests for video.
- [ ] **Migrate marketing copy into i18n** — homepage components still have
      hard-coded Spanish; move strings into `src/messages/`.
- [ ] **Language switcher** UI (writes the `NEXT_LOCALE` cookie).
- [ ] **OAuth**: add Google / Facebook providers to better-auth.
- [ ] **Avatar upload** (currently just a URL field).
- [ ] **Content models**: posts/blog, community comments (incl. admin-seeded
      comments), contact-message inbox — back them with real tables + admin CRUD.
- [ ] **Donations**: make the methods configurable from the admin panel.

## Notes / gotchas

- Prisma 7's `prisma-client` engine **requires a driver adapter** — see
  `src/lib/prisma.ts`. Don't `new PrismaClient()` without one.
- better-auth admin endpoints enforce CSRF (need an `Origin` header). The
  browser client handles this automatically; raw `curl` tests must add `-H Origin:...`.
- Local Postgres is on host port **5433** (5432 is used by another project).
