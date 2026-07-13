import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import {
  isValidViewKey,
  getViewCount,
  getVisitEventCount,
  getVisitCountryBreakdown,
  listVisits,
} from "@/lib/views";
import { parseUserAgent, flagEmoji, refererHost } from "@/lib/user-agent";

const PER_PAGE = 50;

/** Human name for a view key (survey title, page title, or a friendly label). */
async function resolveName(key: string): Promise<string> {
  if (key === "page:home") return "Inicio";
  if (key === "page:articles") return "Artículos";
  if (key.startsWith("survey:")) {
    const s = await prisma.survey.findUnique({
      where: { id: key.slice(7) },
      select: { title: true },
    });
    return s?.title ?? key;
  }
  if (key.startsWith("page:")) {
    const slug = key.slice(5);
    const p = await prisma.staticPage.findFirst({
      where: { slug },
      select: { title: true },
    });
    return p?.title || slug;
  }
  return key;
}

export default async function VisitsPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string; page?: string }>;
}) {
  const { key, page: pageParam } = await searchParams;
  const t = await getTranslations("admin.visits");

  if (!key || !isValidViewKey(key)) notFound();

  const page = Math.max(1, Number(pageParam) || 1);
  const [name, total, eventCount, countries, rows] = await Promise.all([
    resolveName(key),
    getViewCount(key),
    getVisitEventCount(key),
    getVisitCountryBreakdown(key),
    listVisits(key, { take: PER_PAGE, skip: (page - 1) * PER_PAGE }),
  ]);

  const totalPages = Math.max(1, Math.ceil(eventCount / PER_PAGE));
  const fmt = (d: Date) =>
    d.toLocaleString("es-VE", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "America/Caracas",
    });

  const location = (r: (typeof rows)[number]) => {
    const flag = flagEmoji(r.countryCode);
    const parts = [r.city, r.region, r.country].filter(Boolean);
    // Drop region when it duplicates the city, keep it compact.
    const label = [r.city, r.country].filter(Boolean).join(", ") || parts.join(", ");
    return { flag, label };
  };

  return (
    <div>
      <header className="mb-8">
        <Link href="/admin" className="text-sm text-ink/50 hover:text-brand">
          ← {t("back")}
        </Link>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-ink">{t("title")}</h1>
        <p className="mt-1 text-ink/60">
          {name} · <span className="tabular-nums">{total.toLocaleString()}</span> {t("visits")}
        </p>
      </header>

      {countries.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {countries.map((c) => (
            <span
              key={c.countryCode + c.country}
              className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-white px-3 py-1.5 text-sm text-ink/70 shadow-sm"
            >
              <span>{flagEmoji(c.countryCode)}</span>
              <span>{c.country}</span>
              <span className="tabular-nums font-semibold text-ink/50">{c.count}</span>
            </span>
          ))}
        </div>
      )}

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-ink/5 bg-white p-10 text-center text-sm text-ink/40 shadow-sm">
          {t("empty")}
        </p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-ink/5 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-ink/10 bg-gray-50 text-xs uppercase tracking-wide text-ink/50">
                <tr>
                  <th className="px-5 py-3 font-semibold">{t("colWhen")}</th>
                  <th className="px-5 py-3 font-semibold">{t("colLocation")}</th>
                  <th className="px-5 py-3 font-semibold">{t("colIp")}</th>
                  <th className="px-5 py-3 font-semibold">{t("colBrowser")}</th>
                  <th className="px-5 py-3 font-semibold">{t("colSource")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {rows.map((r) => {
                  const ua = parseUserAgent(r.userAgent);
                  const loc = location(r);
                  const host = refererHost(r.referer);
                  return (
                    <tr key={r.id} className="hover:bg-gray-50/50">
                      <td className="whitespace-nowrap px-5 py-3 text-ink/80 tabular-nums">
                        {fmt(r.createdAt)}
                      </td>
                      <td className="px-5 py-3 text-ink/70">
                        {loc.label ? (
                          <span>
                            {loc.flag && <span className="mr-1.5">{loc.flag}</span>}
                            {loc.label}
                          </span>
                        ) : (
                          <span className="text-ink/30">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-ink/50">
                        {r.ip || "—"}
                      </td>
                      <td className="px-5 py-3 text-ink/70">
                        {ua.browser}
                        <span className="text-ink/40"> · {ua.os}</span>
                      </td>
                      <td className="px-5 py-3 text-ink/60">
                        {host ? (
                          <span className="rounded-full bg-brand/5 px-2 py-0.5 text-xs text-brand">{host}</span>
                        ) : (
                          <span className="text-ink/40">{t("direct")}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-5 flex items-center justify-between text-sm">
              <span className="text-ink/40">
                {t("pageOf", { page, total: totalPages })}
              </span>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link
                    href={`/admin/visits?key=${encodeURIComponent(key)}&page=${page - 1}`}
                    className="rounded-full border border-ink/10 bg-white px-4 py-2 font-medium text-ink/70 shadow-sm hover:border-brand/30 hover:text-brand"
                  >
                    ← {t("prev")}
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={`/admin/visits?key=${encodeURIComponent(key)}&page=${page + 1}`}
                    className="rounded-full border border-ink/10 bg-white px-4 py-2 font-medium text-ink/70 shadow-sm hover:border-brand/30 hover:text-brand"
                  >
                    {t("next")} →
                  </Link>
                )}
              </div>
            </div>
          )}

          {eventCount < total && (
            <p className="mt-4 text-xs text-ink/40">{t("partialNote")}</p>
          )}
        </>
      )}
    </div>
  );
}
