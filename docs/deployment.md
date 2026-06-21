# Deployment (EasyPanel)

The app is deployed on **EasyPanel** as a Docker service, on the domain
**mirutafit.com** (already pointed at EasyPanel via Hostinger DNS).

## Image

`Dockerfile` builds a multi-stage image:

1. `deps` — full install (for building).
2. `proddeps` — `npm ci --omit=dev` (runtime deps, includes the Prisma CLI so
   migrations can run).
3. `builder` — `prisma generate` + `next build` (standalone output).
4. `runner` — Next.js standalone server + Prisma migration tooling.

On startup, `docker-entrypoint.sh` runs `prisma migrate deploy` and then boots
the server. `next.config.ts` sets `output: "standalone"`.

## EasyPanel setup

1. **Create a Postgres service** (version 17). Note its internal connection
   string.
2. **Create an App service** from this Git repo (Dockerfile build).
3. Set **environment variables** (see `.env.example`):
   - `DATABASE_URL` → the Postgres service's **internal** connection string.
   - `BETTER_AUTH_SECRET` → a fresh random secret.
   - `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` → `https://mirutafit.com`.
   - `ADMIN_EMAILS` → `admin@mirutafit.com,sluy1283@gmail.com`.
4. Expose port **3000** and attach the `mirutafit.com` domain (EasyPanel handles
   HTTPS).
5. **Mount persistent volumes** for uploaded files so they survive redeploys:
   - `/app/storage/media` — admin Media library.
   - `/app/public/uploads` — user uploads (avatars).
6. Deploy. Migrations apply automatically on first boot.

## Local production smoke test

```bash
docker build -t mirutafit-web:test .
docker run --rm --network mirutafit-website_default \
  -e DATABASE_URL="postgresql://mirutafit:mirutafit_dev_password@db:5432/mirutafit?schema=public" \
  -e BETTER_AUTH_SECRET="dev-secret" \
  -e BETTER_AUTH_URL="http://localhost:3001" \
  -e NEXT_PUBLIC_APP_URL="http://localhost:3001" \
  -e ADMIN_EMAILS="admin@mirutafit.com,sluy1283@gmail.com" \
  -p 3001:3000 mirutafit-web:test
```

(Uses the `db` service from `docker-compose.yml` on the compose network.)

## SMTP / email

Outbound email (to send from an `@mirutafit.com` address) is configured at
runtime from the **Admin → System settings → SMTP** section, stored in the
database. See the roadmap.
