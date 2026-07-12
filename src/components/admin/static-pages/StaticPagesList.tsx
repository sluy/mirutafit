"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { TrashIcon, ExternalLinkIcon, LinkIcon } from "@/components/icons";
import type { StaticPageListItem } from "@/lib/static-pages-shared";
import {
  createStaticPageAction,
  deleteStaticPageAction,
} from "@/app/admin/static-pages/actions";

export default function StaticPagesList({ pages }: { pages: StaticPageListItem[] }) {
  const t = useTranslations("admin.staticPages");
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const create = async () => {
    setBusy(true);
    const { id } = await createStaticPageAction();
    router.push(`/admin/static-pages/${id}`);
  };

  const copyLink = async (slug: string) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/static/${slug}`);
      toast.success(t("linkCopied"));
    } catch {
      toast.error(t("error"));
    }
  };

  const remove = async (id: string) => {
    if (!confirm(t("confirmDelete"))) return;
    const { ok } = await deleteStaticPageAction(id);
    if (ok) {
      toast.success(t("deleted"));
      router.refresh();
    } else toast.error(t("error"));
  };

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <button
          type="button"
          onClick={create}
          disabled={busy}
          className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition-transform hover:scale-105 disabled:opacity-60"
        >
          {busy ? "…" : `+ ${t("new")}`}
        </button>
      </div>

      {pages.length === 0 ? (
        <p className="rounded-2xl border border-ink/5 bg-white p-10 text-center text-sm text-ink/40 shadow-sm">
          {t("empty")}
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink/5 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink/10 bg-gray-50 text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="px-6 py-3 font-semibold">{t("colTitle")}</th>
                <th className="px-6 py-3 font-semibold">{t("colStatus")}</th>
                <th className="px-6 py-3 text-right font-semibold">{t("colActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {pages.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <Link href={`/admin/static-pages/${p.id}`} className="font-medium text-ink hover:text-brand">
                      {p.title || t("untitled")}
                    </Link>
                    <span className="ml-2 font-mono text-xs text-ink/40">/static/{p.slug}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                        p.published ? "bg-emerald-100 text-emerald-700" : "bg-ink/5 text-ink/50"
                      }`}
                    >
                      {p.published ? t("published") : t("draft")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button type="button" onClick={() => copyLink(p.slug)} className="grid h-8 w-8 place-items-center rounded-lg text-ink/30 hover:bg-brand/10 hover:text-brand" title={t("copyLink")}>
                        <LinkIcon width={15} height={15} />
                      </button>
                      {p.published && (
                        <a href={`/static/${p.slug}`} target="_blank" rel="noopener noreferrer" className="grid h-8 w-8 place-items-center rounded-lg text-ink/30 hover:bg-brand/10 hover:text-brand" title={t("openPublic")}>
                          <ExternalLinkIcon width={15} height={15} />
                        </a>
                      )}
                      <button type="button" onClick={() => remove(p.id)} className="grid h-8 w-8 place-items-center rounded-lg text-ink/30 hover:bg-red-50 hover:text-red-600">
                        <TrashIcon width={16} height={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
