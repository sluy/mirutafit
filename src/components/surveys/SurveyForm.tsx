"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { CheckIcon } from "@/components/icons";
import type { PublicSurvey, SurveyQuestionData } from "@/lib/surveys-shared";
import { submitSurveyAction } from "@/app/encuestas/actions";

export default function SurveyForm({ survey }: { survey: PublicSurvey }) {
  const t = useTranslations("surveys");
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const setVal = (id: string, value: string) => {
    setValues((v) => ({ ...v, [id]: value }));
    setErrors((e) => {
      if (!e.has(id)) return e;
      const next = new Set(e);
      next.delete(id);
      return next;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // Validate required
    const missing = new Set<string>();
    for (const q of survey.questions) {
      if (q.required && !(values[q.id] ?? "").trim()) missing.add(q.id);
    }
    if (missing.size) {
      setErrors(missing);
      toast.error(t("missingRequired"));
      document.getElementById(`q-${[...missing][0]}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSending(true);
    try {
      const answers = survey.questions
        .filter((q) => (values[q.id] ?? "").trim())
        .map((q) => ({ questionId: q.id, value: values[q.id] }));
      const res = await submitSurveyAction(survey.slug, answers);
      if (res.ok) setDone(true);
      else toast.error(t("error"));
    } catch {
      toast.error(t("error"));
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-3xl border border-ink/5 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-brand/10 text-brand">
          <CheckIcon width={28} height={28} />
        </div>
        <h1 className="font-display text-2xl font-extrabold text-ink">{t("thanksTitle")}</h1>
        <p className="mt-3 whitespace-pre-wrap text-ink/70">{survey.submitText || t("thanksDefault")}</p>
      </div>
    );
  }

  // A section heading is shown when a question's section differs from the
  // previous (non-empty) one. Pure helper — no mutable render state.
  const showSectionHeader = (index: number): boolean => {
    const s = survey.questions[index].section;
    if (!s) return false;
    for (let j = index - 1; j >= 0; j--) {
      if (survey.questions[j].section) return survey.questions[j].section !== s;
    }
    return true;
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-extrabold leading-tight text-ink sm:text-4xl">{survey.title}</h1>
        {survey.description && <p className="mt-4 whitespace-pre-wrap leading-relaxed text-ink/70">{survey.description}</p>}
        {survey.disclaimer && (
          <p className="mt-5 whitespace-pre-wrap rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-800">
            {survey.disclaimer}
          </p>
        )}
      </div>

      <div className="space-y-5">
        {survey.questions.map((q, i) => {
          const showSection = showSectionHeader(i);
          return (
            <div key={q.id}>
              {showSection && (
                <h2 className="mb-3 mt-8 border-b border-ink/10 pb-2 font-display text-lg font-bold text-brand first:mt-0">
                  {q.section}
                </h2>
              )}
              <QuestionField
                q={q}
                value={values[q.id] ?? ""}
                error={errors.has(q.id)}
                requiredLabel={t("required")}
                onChange={(v) => setVal(q.id, v)}
              />
            </div>
          );
        })}
      </div>

      <button
        type="submit"
        disabled={sending}
        className="mt-8 w-full rounded-full bg-brand py-3.5 font-semibold text-white shadow-lg shadow-brand/30 transition-transform hover:scale-[1.01] disabled:opacity-60"
      >
        {sending ? t("sending") : t("submit")}
      </button>
    </form>
  );
}

const inputCls =
  "w-full rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/30 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30";

function QuestionField({
  q,
  value,
  error,
  requiredLabel,
  onChange,
}: {
  q: SurveyQuestionData;
  value: string;
  error: boolean;
  requiredLabel: string;
  onChange: (v: string) => void;
}) {
  const choices = q.options.choices ?? [];
  const selected: string[] = q.type === "multiple_choice" && value ? safeParse(value) : [];

  const toggleMulti = (choice: string) => {
    const next = selected.includes(choice) ? selected.filter((c) => c !== choice) : [...selected, choice];
    onChange(next.length ? JSON.stringify(next) : "");
  };

  const min = q.options.min ?? 1;
  const max = q.options.max ?? 10;

  return (
    <div id={`q-${q.id}`} className={`rounded-2xl border bg-white p-5 shadow-sm ${error ? "border-red-300" : "border-ink/5"}`}>
      <label className="block text-sm font-semibold text-ink">
        {q.label}
        {q.required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {q.help && <p className="mt-1 text-xs text-ink/50">{q.help}</p>}
      {error && <p className="mt-1 text-xs font-medium text-red-500">{requiredLabel}</p>}

      <div className="mt-3">
        {q.type === "short_text" && (
          <input value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} />
        )}
        {q.type === "number" && (
          <input type="number" value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} />
        )}
        {q.type === "long_text" && (
          <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={4} className={`${inputCls} resize-none`} />
        )}

        {q.type === "single_choice" && (
          <div className="flex flex-wrap gap-2">
            {choices.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onChange(c)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${value === c ? "border-brand bg-brand text-white" : "border-ink/15 text-ink/70 hover:border-brand hover:text-brand"}`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {q.type === "multiple_choice" && (
          <div className="flex flex-wrap gap-2">
            {choices.map((c) => {
              const on = selected.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleMulti(c)}
                  className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${on ? "border-brand bg-brand text-white" : "border-ink/15 text-ink/70 hover:border-brand hover:text-brand"}`}
                >
                  {on && <CheckIcon width={13} height={13} />}
                  {c}
                </button>
              );
            })}
          </div>
        )}

        {q.type === "scale" && (
          <div>
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: Math.max(1, max - min + 1) }, (_, i) => min + i).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => onChange(String(n))}
                  className={`grid h-10 w-10 place-items-center rounded-xl border text-sm font-bold transition-colors ${value === String(n) ? "border-brand bg-brand text-white" : "border-ink/15 text-ink/60 hover:border-brand hover:text-brand"}`}
                >
                  {n}
                </button>
              ))}
            </div>
            {(q.options.minLabel || q.options.maxLabel) && (
              <div className="mt-1.5 flex justify-between text-xs text-ink/40">
                <span>{q.options.minLabel}</span>
                <span>{q.options.maxLabel}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function safeParse(value: string): string[] {
  try {
    const arr = JSON.parse(value);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
