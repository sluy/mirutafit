import { prisma } from "./prisma";
import { geolocate } from "./geo";

/**
 * Anecdotal page-view counter. Keys are stable strings:
 *   "page:home", "page:articles", "article:<id>", "survey:<id>".
 * Incremented from the client via POST /api/views (once per session per key).
 */

// Only these key shapes may be recorded (prevents arbitrary row spam).
const KEY_RE = /^(page:[a-z0-9-]{1,40}|(article|survey):[a-z0-9]{1,40})$/;

export function isValidViewKey(key: string): boolean {
  return KEY_RE.test(key);
}

export async function recordView(key: string): Promise<void> {
  if (!isValidViewKey(key)) return;
  await prisma.pageView.upsert({
    where: { key },
    create: { key, count: 1 },
    update: { count: { increment: 1 } },
  });
}

export async function getViewCount(key: string): Promise<number> {
  const row = await prisma.pageView.findUnique({ where: { key } });
  return row?.count ?? 0;
}

/** Returns a map of key -> count for the requested keys (missing = 0). */
export async function getViewCounts(
  keys: string[],
): Promise<Record<string, number>> {
  if (keys.length === 0) return {};
  const rows = await prisma.pageView.findMany({ where: { key: { in: keys } } });
  const map: Record<string, number> = {};
  for (const k of keys) map[k] = 0;
  for (const r of rows) map[r.key] = r.count;
  return map;
}

// ── Detailed visit history ────────────────────────────────────

export type VisitorMeta = {
  ip?: string;
  userAgent?: string;
  referer?: string;
  countryCode?: string; // fallback from a proxy header (e.g. cf-ipcountry)
};

/**
 * Record one detailed visit event (fed the running counter separately). Runs
 * an IP geolocation lookup best-effort. Meant to be called from `after()` so it
 * never delays the response. Never throws.
 */
export async function recordVisitEvent(key: string, v: VisitorMeta): Promise<void> {
  if (!isValidViewKey(key)) return;
  try {
    const ip = (v.ip ?? "").slice(0, 45);
    const geo = ip ? await geolocate(ip) : null;
    await prisma.viewEvent.create({
      data: {
        key,
        ip,
        country: geo?.country ?? "",
        countryCode: geo?.countryCode || (v.countryCode ?? ""),
        region: geo?.region ?? "",
        city: geo?.city ?? "",
        userAgent: (v.userAgent ?? "").slice(0, 400),
        referer: (v.referer ?? "").slice(0, 400),
      },
    });
  } catch {
    // best-effort — visit history must never break a page view
  }
}

export type VisitRow = {
  id: string;
  createdAt: Date;
  ip: string;
  country: string;
  countryCode: string;
  region: string;
  city: string;
  userAgent: string;
  referer: string;
};

/** How many detailed events we have stored for a key. */
export async function getVisitEventCount(key: string): Promise<number> {
  return prisma.viewEvent.count({ where: { key } });
}

/** A page of visit events for a key, newest first. */
export async function listVisits(
  key: string,
  { take, skip }: { take: number; skip: number },
): Promise<VisitRow[]> {
  return prisma.viewEvent.findMany({
    where: { key },
    orderBy: { createdAt: "desc" },
    take,
    skip,
  });
}

export type CountryCount = { countryCode: string; country: string; count: number };

/** Top countries for a key (for the little summary chips). */
export async function getVisitCountryBreakdown(key: string): Promise<CountryCount[]> {
  const rows = await prisma.viewEvent.groupBy({
    by: ["countryCode", "country"],
    where: { key, NOT: { country: "" } },
    _count: { _all: true },
    orderBy: { _count: { countryCode: "desc" } },
    take: 8,
  });
  return rows.map((r) => ({
    countryCode: r.countryCode,
    country: r.country,
    count: r._count._all,
  }));
}
