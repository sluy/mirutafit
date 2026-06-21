# Database

PostgreSQL 17. Locally it runs in Docker (`docker-compose.yml`) on host port
**5433**. In production it's an EasyPanel-managed Postgres service.

## Prisma 7 specifics (important)

This project uses Prisma 7, which differs from older Prisma:

- Generator is `prisma-client` (not `prisma-client-js`). The client is generated
  into `src/generated/prisma/` (git-ignored). Import it from
  `@/generated/prisma/client`.
- The generated client uses the **client engine**, which **requires a driver
  adapter**. We use `@prisma/adapter-pg` — see `src/lib/prisma.ts`. A plain
  `new PrismaClient()` without an adapter throws.
- Config lives in `prisma.config.ts` (schema path, migrations path, datasource
  url via `dotenv`). The `datasource` block in `schema.prisma` has no `url`.

## Commands

```bash
npx prisma migrate dev --name <change>   # create + apply a migration (dev)
npx prisma migrate deploy                # apply pending migrations (prod/CI)
npx prisma generate                      # regenerate the client
npx prisma studio                        # browse data
```

In production the container runs `migrate deploy` automatically on startup
(see `docker-entrypoint.sh`).

## Models

Auth models follow better-auth's expected shape — **do not rename their fields**.

- `User` (`user`) — `id, name, email, emailVerified, image, role, banned,
  banReason, banExpires` + optional profile `firstName, lastName, country,
  phone`. `role` is a comma-separated list (e.g. `"user,admin"`).
- `Session` (`session`) — sessions issued by better-auth.
- `Account` (`account`) — credentials/OAuth; hashed password lives here.
- `Verification` (`verification`) — email/reset tokens.

- `SystemSetting` (`system_setting`) — key/value JSON store for admin-managed
  config. Keys: `smtp` (email), `registration` (`{ enabled }`, gates sign-up),
  `codePolicy` (verification-code rules). Helpers in `src/lib/settings.ts`.
- `VerificationCode` (`verification_code`) — one-time codes (hashed) for the
  reusable verification module (`src/lib/verification-codes.ts`); used by
  password recovery. See [auth](auth.md).
- `MediaFolder` / `MediaFile` (`media_folder` / `media_file`) — the admin Media
  library. See [media](media.md).

- `Widget` (`widget`) / `Page` (`page`) — the page builder. `Widget` holds
  configured block instances; `Page.layout` is the rows/columns/widget tree.
  See [widgets](widgets.md).

Other app domain models (posts, comments, contact messages) are added as their
features are built — keep them documented here.
