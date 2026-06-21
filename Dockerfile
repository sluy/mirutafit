# syntax=docker/dockerfile:1

# ─────────────────────────────────────────────────────────────
# MiRutaFit — production image for EasyPanel
# Next.js 16 (standalone) + Prisma 7 (pg driver adapter)
# ─────────────────────────────────────────────────────────────

# ---- Stage 1: full dependencies (for building) ----
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- Stage 2: production-only dependencies (for the runtime image) ----
# Includes the Prisma CLI (a regular dependency) so `migrate deploy` works,
# but drops dev tooling (eslint, typescript, tailwind, ...).
FROM node:24-alpine AS proddeps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---- Stage 3: build ----
FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Generate the Prisma client, then build the standalone Next.js bundle.
RUN npx prisma generate
RUN npm run build

# ---- Stage 4: runtime ----
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Next.js standalone server + static assets.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Production node_modules (overlays the trimmed one from standalone) so the
# Prisma CLI and its dependencies are available for migrations at startup.
COPY --from=proddeps --chown=nextjs:nodejs /app/node_modules ./node_modules

# Prisma schema + migrations + config, needed by `prisma migrate deploy`.
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts

COPY --chown=nextjs:nodejs docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

USER nextjs
EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
