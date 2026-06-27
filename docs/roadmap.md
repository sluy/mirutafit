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

- [x] **Articles module** — all six phases (see [articles.md](articles.md)):
      shared taxonomies (categories/tags) + admin CRUD; article CRUD with a
      Word-like Tiptap editor (tables/images/video from the Media library);
      public `/articles` listing (search/category/tags/order/pagination) +
      `/articles/[date]/[slug]` detail with SEO; an `articles` page-builder widget
      (latest/first/manual, category filter, columns); and a dynamic navbar
      category menu (`menuCategories`).

- [x] **Community module** — see [community.md](community.md): a `community`
      page-builder widget (approved comment wall + submission form with honeypot)
      backed by a `Comment` table; admin moderation at `/admin/community/comments`
      (approve / hide / delete, seed comments, pre/post-moderation toggle).

- [x] **Donations widget** — a configurable "support me" banner for the page
      builder (`donations` widget): dark section + copyable payment methods, each
      with name/detail/badge color and an optional link (turns "Copy" into a
      "Donate" link). Methods are managed from the widget editor in the admin.

- [x] **Contact module** — see [contact.md](contact.md): a configurable Contact
      **widget** (banner + form, person/sponsor modes) for the page builder;
      public submissions saved to a `ContactMessage` table with a honeypot;
      admin inbox (`/admin/contact/messages`) with read/unread + delete; and
      admin-configurable recipient + sender emails (`/admin/contact/settings`),
      notifications sent via the SMTP account with Reply-To set to the visitor.

- [x] **Configurable i18n + language switcher** — see [i18n.md](i18n.md): admin
      locale settings (single vs. multi, enabled languages, default), per-request
      resolution (cookie → account language → browser → fallback), `User.language`
      stamped at signup, and a navbar **language switcher** item. Plus a **go-top**
      floating-button widget and a fix for navbar widget-anchor scrolling.
- [x] **Translatable widget/navbar content** — `LocalizedText` fields + per-locale
      language tabs in every widget editor; renders resolve to the active locale
      (see [i18n.md](i18n.md)). Admin-authored content is now bilingual, not just
      the next-intl chrome.

- [x] **Google OAuth (admin-configurable)** — `socialProviders.google` in better-auth,
      credentials stored in the DB (`oauth` setting, secret kept like SMTP) and an
      enable toggle + Client ID/Secret form under **Users → Settings**. "Continue
      with Google" button on login/register (gated live). Credentials are read at
      startup (changing them needs a restart). Facebook can be added the same way.

## Next

- [ ] **Facebook OAuth** — same pattern as Google (add `facebook` provider + admin fields).
- [ ] **Static video thumbnails** (ffmpeg) + HTTP range requests for video.
- [ ] **Migrate marketing copy into i18n** — the legacy homepage fallback
      (`src/components/*`) still has hard-coded Spanish; move strings into
      `src/messages/` (low priority — the real site is widget-composed).
- [ ] **OAuth**: add Google / Facebook providers to better-auth.

## Notes / gotchas

- Prisma 7's `prisma-client` engine **requires a driver adapter** — see
  `src/lib/prisma.ts`. Don't `new PrismaClient()` without one.
- better-auth admin endpoints enforce CSRF (need an `Origin` header). The
  browser client handles this automatically; raw `curl` tests must add `-H Origin:...`.
- Local Postgres is on host port **5433** (5432 is used by another project).
