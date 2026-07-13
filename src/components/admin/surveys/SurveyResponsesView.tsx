"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ChevronDownIcon } from "@/components/icons";
import { deleteSurveyResponseAction } from "@/app/admin/surveys/actions";
import type { ResponseRow, SurveyQuestionData } from "@/lib/surveys-shared";

export default function SurveyResponsesView({
  questions,
  responses: initial,
}: {
  questions: SurveyQuestionData[];
  responses: ResponseRow[];
}) {
  const t = useTranslations("admin.surveys");
  const router = useRouter();
  const [responses, setResponses] = useState(initial);
  const [openId, setOpenId] = useState<string | null>(responses[0]?.id ?? null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm(t("deleteResponseConfirm"))) return;
    setDeletingId(id);
    try {
      const res = await deleteSurveyResponseAction(id);
      if (res.ok) {
        setResponses((prev) => prev.filter((r) => r.id !== id));
        if (openId === id) setOpenId(null);
        toast.success(t("responseDeleted"));
        router.refresh();
      }
    } catch {
      toast.error(t("error"));
    } finally {
      setDeletingId(null);
    }
  };

  if (responses.length === 0) {
    return (
      <p className="rounded-2xl border border-ink/5 bg-white p-12 text-center text-sm text-ink/40 shadow-sm">
        {t("noResponses")}
      </p>
    );
  }

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

  const preview = (r: ResponseRow) => {
    const first = questions.find((q) => r.values[q.id]);
    return first ? r.values[first.id].slice(0, 60) : "—";
  };

  return (
    <div className="space-y-2">
      {responses.map((r, i) => {
        const open = openId === r.id;
        return (
          <div key={r.id} className="overflow-hidden rounded-2xl border border-ink/5 bg-white shadow-sm">
            <button
              type="button"
              onClick={() => setOpenId(open ? null : r.id)}
              className="flex w-full items-center gap-3 px-5 py-4 text-left"
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand/10 text-xs font-bold text-brand">
                {responses.length - i}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-ink/80">{preview(r)}</span>
                <span className="block text-xs text-ink/40">{fmt(r.createdAt)}</span>
              </span>
              <ChevronDownIcon width={16} height={16} className={`shrink-0 text-ink/30 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
            {open && (
              <div className="border-t border-ink/10 px-5 py-4">
                <div className="space-y-4">
                  {questions.map((q) => {
                    const val = r.values[q.id];
                    return (
                      <div key={q.id}>
                        <p className="text-xs font-medium text-ink/50">{q.label || t("qtype_" + q.type)}</p>
                        <p className="mt-0.5 whitespace-pre-wrap text-sm text-ink/85">
                          {val ? renderValue(val) : <span className="text-ink/30">—</span>}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Action buttons */}
                <div className="mt-5 flex items-center gap-3 border-t border-ink/5 pt-4">
                  <a
                    href={`/api/admin/surveys/${r.id}/pdf`}
                    download
                    className="inline-flex items-center gap-1.5 rounded-lg border border-ink/10 bg-white px-3 py-1.5 text-xs font-medium text-ink/70 shadow-sm transition-all hover:border-brand/30 hover:text-brand"
                  >
                    <DownloadIcon />
                    {t("downloadPdf")}
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDelete(r.id)}
                    disabled={deletingId === r.id}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-500 shadow-sm transition-all hover:border-red-300 hover:bg-red-50 disabled:opacity-50"
                  >
                    <TrashIcon />
                    {deletingId === r.id ? "…" : t("deleteResponse")}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** multiple_choice answers are stored as a JSON array; render them as a list. */
function renderValue(value: string): string {
  if (value.startsWith("[")) {
    try {
      const arr = JSON.parse(value);
      if (Array.isArray(arr)) return arr.join(", ");
    } catch {
      /* fall through */
    }
  }
  return value;
}

function DownloadIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}
