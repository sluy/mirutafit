import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getViewCounts } from "@/lib/views";
import { UsersIcon, HeartIcon, ClockIcon } from "@/components/icons";

export default async function AdminDashboardPage() {
  const t = await getTranslations("admin.dashboard");

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [total, admins, banned, newThisWeek, recent, pageViews] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: { contains: "admin" } } }),
    prisma.user.count({ where: { banned: true } }),
    prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, createdAt: true, role: true },
    }),
    getViewCounts(["page:home", "page:articles"]),
  ]);

  const staticViews = [
    { label: t("viewHome"), value: pageViews["page:home"] ?? 0 },
    { label: t("viewArticles"), value: pageViews["page:articles"] ?? 0 },
  ];

  const stats = [
    { label: t("totalUsers"), value: total, Icon: UsersIcon, color: "bg-brand" },
    { label: t("admins"), value: admins, Icon: HeartIcon, color: "bg-emerald-500" },
    { label: t("banned"), value: banned, Icon: UsersIcon, color: "bg-red-500" },
    { label: t("newThisWeek"), value: newThisWeek, Icon: ClockIcon, color: "bg-lime-500" },
  ];

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl font-extrabold text-ink">{t("title")}</h1>
        <p className="mt-1 text-ink/60">{t("subtitle")}</p>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, Icon, color }) => (
          <div key={label} className="rounded-2xl border border-ink/5 bg-white p-5 shadow-sm">
            <div className={`grid h-10 w-10 place-items-center rounded-xl ${color} text-white`}>
              <Icon width={18} height={18} />
            </div>
            <p className="mt-4 font-display text-3xl font-extrabold text-ink">{value}</p>
            <p className="text-sm text-ink/50">{label}</p>
          </div>
        ))}
      </div>

      <section className="mt-8">
        <h2 className="mb-4 font-display text-lg font-bold text-ink">{t("pageViews")}</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {staticViews.map((v) => (
            <div key={v.label} className="rounded-2xl border border-ink/5 bg-white p-5 shadow-sm">
              <p className="font-display text-3xl font-extrabold text-ink tabular-nums">
                {v.value.toLocaleString()}
              </p>
              <p className="text-sm text-ink/50">{v.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 font-display text-lg font-bold text-ink">{t("recentUsers")}</h2>
        <div className="overflow-hidden rounded-2xl border border-ink/5 bg-white shadow-sm">
          {recent.length === 0 ? (
            <p className="p-6 text-sm text-ink/50">—</p>
          ) : (
            <ul className="divide-y divide-ink/5">
              {recent.map((u) => (
                <li key={u.id} className="flex items-center gap-4 px-6 py-4">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-brand/10 font-display font-bold text-brand">
                    {(u.name || u.email).charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink">{u.name || "—"}</p>
                    <p className="truncate text-sm text-ink/50">{u.email}</p>
                  </div>
                  <span className="shrink-0 text-sm text-ink/40">
                    {u.createdAt.toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
