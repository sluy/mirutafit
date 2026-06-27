import { getLocale } from "next-intl/server";
import { listPublicComments } from "@/lib/community";
import { QuoteIcon } from "@/components/icons";
import { resolveText } from "../i18n";
import type { CommunityConfig } from "../types";
import CommentForm from "./CommentForm";

/** Frontend render for the Community widget: a wall of approved comments + form. */
export default async function CommunityWidget({ config }: { config: CommunityConfig }) {
  const locale = await getLocale();
  const comments = await listPublicComments(config.count ?? 8);
  const eyebrow = resolveText(config.eyebrow, locale);
  const heading = resolveText(config.heading, locale);
  const subtitle = resolveText(config.subtitle, locale);
  const emptyText = resolveText(config.emptyText, locale);

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });

  const wallCols = config.showForm ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          {eyebrow && (
            <p className="text-sm font-semibold uppercase tracking-wider text-brand">{eyebrow}</p>
          )}
          <h2 className="mt-2 font-display text-3xl font-extrabold text-ink sm:text-4xl">{heading}</h2>
          {subtitle && <p className="mt-3 text-ink/60">{subtitle}</p>}
        </div>

        <div className={`mt-14 grid gap-10 ${config.showForm ? "lg:grid-cols-[1fr_360px]" : ""}`}>
          {/* Comment wall */}
          {comments.length === 0 ? (
            <p className="rounded-3xl border border-dashed border-ink/15 p-12 text-center text-ink/40">
              {emptyText}
            </p>
          ) : (
            <div className={`grid gap-5 ${wallCols}`}>
              {comments.map((c) => (
                <div key={c.id} className="relative flex flex-col rounded-3xl border border-ink/5 bg-gray-50 p-6 shadow-sm">
                  <QuoteIcon className="text-brand/30" width={28} height={28} />
                  <p className="mt-3 flex-1 leading-relaxed text-ink/80">{c.message}</p>
                  <div className="mt-5 flex items-center gap-3">
                    <span
                      className="grid h-10 w-10 place-items-center rounded-full font-display font-bold text-white"
                      style={{ backgroundColor: c.avatarColor }}
                    >
                      {c.name.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <p className="font-semibold text-ink">{c.name}</p>
                      <p className="text-xs text-ink/50">{fmt(c.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Submission form */}
          {config.showForm && (
            <CommentForm title={resolveText(config.formTitle, locale)} subtitle={resolveText(config.formSubtitle, locale)} />
          )}
        </div>
      </div>
    </section>
  );
}
