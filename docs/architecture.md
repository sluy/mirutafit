# Architecture

A single Next.js 16 app (App Router) that serves both the public site and the
admin back office, talking to PostgreSQL through Prisma.

```
Browser
  │
  ▼
Next.js 16 (App Router)
  ├── Marketing site        src/app/page.tsx + src/components/*
  ├── Auth pages            src/app/(auth)/login | register
  ├── Admin back office     src/app/admin/*
  └── Auth API (better-auth) src/app/api/auth/[...all]/route.ts
        │
        ▼
better-auth ── Prisma 7 (pg driver adapter) ── PostgreSQL 17
```

## Rendering

- The marketing homepage is a Server Component composed of section components in
  `src/components/`. Interactive bits (navbar scroll, forms) are `"use client"`.
- Because i18n auto-detects the language from request headers/cookies, pages are
  rendered on demand (dynamic) rather than statically prerendered.

## Key modules

- `src/lib/prisma.ts` — single `PrismaClient` (with the `pg` driver adapter),
  reused across hot reloads.
- `src/lib/auth.ts` — better-auth server instance (the source of truth for auth
  behavior: providers, roles, hooks).
- `src/lib/auth-client.ts` — browser client (`signIn`, `signUp`, `useSession`…).
- `src/i18n/` — request-time locale resolution and supported-locale config.

## Data flow for auth

1. Client calls `signUp.email(...)` / `signIn.email(...)` from `auth-client.ts`.
2. Request hits `/api/auth/[...all]` → better-auth handler.
3. better-auth uses the Prisma adapter to read/write `user/session/account`.
4. A session cookie is set; Server Components read it via
   `auth.api.getSession({ headers })`.
