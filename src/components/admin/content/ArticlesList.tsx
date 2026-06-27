"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { TrashIcon } from "@/components/icons";
import type { ArticleListItem } from "@/lib/articles";
import {
  createArticleAction,
  deleteArticleAction,
} from "@/app/admin/content/articles/actions";

export default function ArticlesList({ articles }: { articles: ArticleListItem[] }) {
  const t = useTranslations("admin.articles");
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const create = async () => {
    setBusy(true);
    const { id } = await createArticleAction();
    router.push(`/admin/content/articles/${id}`);
  };

  const remove = async (id: string) => {
    if (!confirm(t("confirmDelete"))) return;
    const { ok } = await deleteArticleAction(id);
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

      {articles.length === 0 ? (
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
                <th className="px-6 py-3 font-semibold">{t("colDate")}</th>
                <th className="px-6 py-3 text-right font-semibold">{t("colActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {articles.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <Link href={`/admin/content/articles/${a.id}`} className="font-medium text-ink hover:text-brand">
                      {a.title}
                    </Link>
                    {a.categoryKeys.length > 0 && (
                      <span className="ml-2 text-xs text-ink/40">{a.categoryKeys.join(", ")}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                        a.status === "published"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-ink/5 text-ink/50"
                      }`}
                    >
                      {a.status === "published" ? t("published") : t("draft")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-ink/50">
                    {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => remove(a.id)}
                        className="grid h-8 w-8 place-items-center rounded-lg text-ink/30 hover:bg-red-50 hover:text-red-600"
                      >
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
