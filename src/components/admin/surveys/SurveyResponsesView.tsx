"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDownIcon } from "@/components/icons";
import type { ResponseRow, SurveyQuestionData } from "@/lib/surveys-shared";

export default function SurveyResponsesView({
  questions,
  responses,
}: {
  questions: SurveyQuestionData[];
  responses: ResponseRow[];
}) {
  const t = useTranslations("admin.surveys");
  const [openId, setOpenId] = useState<string | null>(responses[0]?.id ?? null);

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
              <div className="space-y-4 border-t border-ink/10 px-5 py-4">
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
