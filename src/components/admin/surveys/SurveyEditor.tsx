"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { inputClass } from "@/components/ui/Field";
import { ArrowRightIcon, TrashIcon } from "@/components/icons";
import { slugify } from "@/lib/slug";
import {
  QUESTION_TYPES,
  type QuestionType,
  type SurveyEditData,
  type SurveyQuestionData,
} from "@/lib/surveys-shared";
import { saveSurveyAction } from "@/app/admin/surveys/actions";

const STATUSES = ["draft", "open", "closed"] as const;
const CHOICE_TYPES: QuestionType[] = ["single_choice", "multiple_choice"];

const newQuestion = (section: string): SurveyQuestionData => ({
  id: crypto.randomUUID(),
  section,
  type: "short_text",
  label: "",
  help: "",
  required: false,
  options: {},
  order: 0,
});

export default function SurveyEditor({ survey }: { survey: SurveyEditData }) {
  const t = useTranslations("admin.surveys");
  const router = useRouter();

  const [data, setData] = useState<SurveyEditData>(survey);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = (patch: Partial<SurveyEditData>) => setData((d) => ({ ...d, ...patch }));
  const setQ = (id: string, patch: Partial<SurveyQuestionData>) =>
    setData((d) => ({ ...d, questions: d.questions.map((q) => (q.id === id ? { ...q, ...patch } : q)) }));

  const onTitle = (value: string) => {
    const patch: Partial<SurveyEditData> = { title: value };
    if (!slugTouched) patch.slug = slugify(value);
    set(patch);
  };

  const addQuestion = () =>
    set({ questions: [...data.questions, newQuestion(data.questions.at(-1)?.section ?? "")] });
  const removeQuestion = (id: string) => set({ questions: data.questions.filter((q) => q.id !== id) });
  const moveQuestion = (index: number, dir: -1 | 1) => {
    const next = [...data.questions];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    set({ questions: next });
  };

  const save = async () => {
    setSaving(true);
    const res = await saveSurveyAction(data);
    setSaving(false);
    if (res.ok) {
      toast.success(t("saved"));
      router.refresh();
    } else if (res.error === "title") toast.error(t("errorTitle"));
    else if (res.error === "slug") toast.error(t("errorSlug"));
    else toast.error(t("error"));
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/surveys" className="flex items-center gap-1.5 text-sm text-ink/50 hover:text-brand">
          <ArrowRightIcon width={15} height={15} className="rotate-180" />
          {t("backToList")}
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/admin/surveys/${data.id}/responses`} className="rounded-full border border-ink/10 px-4 py-2.5 text-sm font-medium text-ink/70 hover:border-brand hover:text-brand">
            {t("viewResponses")}
          </Link>
          <button type="button" onClick={save} disabled={saving} className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition-transform hover:scale-105 disabled:opacity-60">
            {saving ? "…" : t("save")}
          </button>
        </div>
      </div>

      {/* Metadata */}
      <div className="mb-6 space-y-4 rounded-2xl border border-ink/5 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/70">{t("fieldTitle")}</label>
            <input value={data.title} onChange={(e) => onTitle(e.target.value)} className={inputClass()} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/70">{t("status")}</label>
            <div className="flex gap-1">
              {STATUSES.map((s) => (
                <button key={s} type="button" onClick={() => set({ status: s })} className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${data.status === s ? "bg-brand text-white" : "bg-ink/5 text-ink/60 hover:bg-brand/10 hover:text-brand"}`}>
                  {t(`status_${s}`)}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink/70">{t("fieldSlug")}</label>
          <input value={data.slug} onChange={(e) => { setSlugTouched(true); set({ slug: slugify(e.target.value) }); }} className={`${inputClass()} font-mono`} />
          <p className="mt-1 text-xs text-ink/40">/encuestas/{data.slug || "…"}</p>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink/70">{t("fieldDescription")}</label>
          <textarea value={data.description} onChange={(e) => set({ description: e.target.value })} rows={3} className={`${inputClass()} resize-none`} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink/70">{t("fieldDisclaimer")}</label>
          <textarea value={data.disclaimer} onChange={(e) => set({ disclaimer: e.target.value })} rows={2} className={`${inputClass()} resize-none`} placeholder={t("disclaimerHint")} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink/70">{t("fieldSubmitText")}</label>
          <textarea value={data.submitText} onChange={(e) => set({ submitText: e.target.value })} rows={2} className={`${inputClass()} resize-none`} placeholder={t("submitTextHint")} />
        </div>
      </div>

      {/* Questions */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-ink">{t("questions")}</h2>
        <span className="text-xs text-ink/40">{data.questions.length}</span>
      </div>
      <p className="mb-4 text-xs text-ink/40">{t("questionsHint")}</p>

      <div className="space-y-3">
        {data.questions.map((q, i) => (
          <QuestionCard
            key={q.id}
            q={q}
            index={i}
            total={data.questions.length}
            t={t}
            onChange={(patch) => setQ(q.id, patch)}
            onMove={(dir) => moveQuestion(i, dir)}
            onRemove={() => removeQuestion(q.id)}
          />
        ))}
      </div>

      <button type="button" onClick={addQuestion} className="mt-4 w-full rounded-2xl border-2 border-dashed border-ink/15 py-3 text-sm font-medium text-ink/50 transition-colors hover:border-brand hover:text-brand">
        + {t("addQuestion")}
      </button>
    </div>
  );
}

function QuestionCard({
  q,
  index,
  total,
  t,
  onChange,
  onMove,
  onRemove,
}: {
  q: SurveyQuestionData;
  index: number;
  total: number;
  t: ReturnType<typeof useTranslations>;
  onChange: (patch: Partial<SurveyQuestionData>) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}) {
  const isChoice = CHOICE_TYPES.includes(q.type);
  const isScale = q.type === "scale";

  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ink/5 text-[11px] font-bold text-ink/40">{index + 1}</span>
        <select value={q.type} onChange={(e) => onChange({ type: e.target.value as QuestionType })} className="rounded-lg border border-ink/10 bg-white px-2 py-1.5 text-xs font-medium text-ink/70">
          {QUESTION_TYPES.map((ty) => (<option key={ty} value={ty}>{t(`qtype_${ty}`)}</option>))}
        </select>
        <label className="ml-auto flex items-center gap-1.5 text-xs text-ink/60">
          <input type="checkbox" checked={q.required} onChange={(e) => onChange({ required: e.target.checked })} className="h-3.5 w-3.5 rounded border-ink/20 text-brand focus:ring-brand" />
          {t("required")}
        </label>
        <div className="flex flex-col">
          <button type="button" onClick={() => onMove(-1)} disabled={index === 0} className="px-1 text-ink/40 hover:text-brand disabled:opacity-30"><ArrowRightIcon width={12} height={12} className="-rotate-90" /></button>
          <button type="button" onClick={() => onMove(1)} disabled={index === total - 1} className="px-1 text-ink/40 hover:text-brand disabled:opacity-30"><ArrowRightIcon width={12} height={12} className="rotate-90" /></button>
        </div>
        <button type="button" onClick={onRemove} className="text-ink/30 hover:text-red-600"><TrashIcon width={15} height={15} /></button>
      </div>

      <div className="grid gap-2 sm:grid-cols-[200px_1fr]">
        <input value={q.section} onChange={(e) => onChange({ section: e.target.value })} placeholder={t("section")} className={`${inputClass()} py-1.5 text-xs`} />
        <input value={q.label} onChange={(e) => onChange({ label: e.target.value })} placeholder={t("questionLabel")} className={`${inputClass()} py-1.5 text-sm`} />
      </div>
      <input value={q.help} onChange={(e) => onChange({ help: e.target.value })} placeholder={t("help")} className={`${inputClass()} mt-2 py-1.5 text-xs`} />

      {isChoice && (
        <div className="mt-2">
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-ink/40">{t("choices")}</label>
          <textarea
            value={(q.options.choices ?? []).join("\n")}
            onChange={(e) => onChange({ options: { ...q.options, choices: e.target.value.split("\n").map((c) => c.trim()).filter(Boolean) } })}
            rows={3}
            placeholder={t("choicesHint")}
            className={`${inputClass()} resize-none py-1.5 text-xs`}
          />
        </div>
      )}
      {isScale && (
        <div className="mt-2 grid gap-2 sm:grid-cols-4">
          <NumField label={t("scaleMin")} value={q.options.min ?? 1} onChange={(v) => onChange({ options: { ...q.options, min: v } })} />
          <NumField label={t("scaleMax")} value={q.options.max ?? 10} onChange={(v) => onChange({ options: { ...q.options, max: v } })} />
          <TxtField label={t("scaleMinLabel")} value={q.options.minLabel ?? ""} onChange={(v) => onChange({ options: { ...q.options, minLabel: v } })} />
          <TxtField label={t("scaleMaxLabel")} value={q.options.maxLabel ?? ""} onChange={(v) => onChange({ options: { ...q.options, maxLabel: v } })} />
        </div>
      )}
    </div>
  );
}

function NumField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-ink/40">{label}</span>
      <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} className={`${inputClass()} py-1.5 text-xs`} />
    </label>
  );
}
function TxtField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-ink/40">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className={`${inputClass()} py-1.5 text-xs`} />
    </label>
  );
}
