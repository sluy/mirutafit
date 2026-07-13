import { prisma } from "./prisma";

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
