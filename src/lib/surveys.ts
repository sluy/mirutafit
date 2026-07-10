import { randomUUID } from "node:crypto";
import { prisma } from "./prisma";
import { slugify } from "./slug";
import {
  QUESTION_TYPES,
  type QuestionType,
  type QuestionOptions,
  type SurveyQuestionData,
  type SurveyEditData,
  type SurveyListItem,
  type PublicSurvey,
  type ResponseRow,
  type SurveyExportData,
} from "./surveys-shared";
import { Prisma } from "@/generated/prisma/client";

// Re-export the client-safe bits so server callers can import from one place.
export {
  QUESTION_TYPES,
  type QuestionType,
  type QuestionOptions,
  type SurveyQuestionData,
  type SurveyEditData,
  type SurveyListItem,
  type PublicSurvey,
  type ResponseRow,
  type SurveyExportData,
} from "./surveys-shared";

function toQuestion(q: {
  id: string;
  section: string;
  type: string;
  label: string;
  help: string;
  required: boolean;
  options: unknown;
  order: number;
}): SurveyQuestionData {
  return {
    id: q.id,
    section: q.section,
    type: (QUESTION_TYPES.includes(q.type as QuestionType) ? q.type : "short_text") as QuestionType,
    label: q.label,
    help: q.help,
    required: q.required,
    options: (q.options as QuestionOptions) ?? {},
    order: q.order,
  };
}

// ── Admin ─────────────────────────────────────────────────────

export async function listSurveys(): Promise<SurveyListItem[]> {
  const rows = await prisma.survey.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { questions: true, responses: true } } },
  });
  return rows.map((s) => ({
    id: s.id,
    slug: s.slug,
    title: s.title,
    status: s.status,
    questionCount: s._count.questions,
    responseCount: s._count.responses,
  }));
}

export async function getSurveyForEdit(id: string): Promise<SurveyEditData | null> {
  const s = await prisma.survey.findUnique({
    where: { id },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!s) return null;
  return {
    id: s.id,
    slug: s.slug,
    title: s.title,
    description: s.description,
    disclaimer: s.disclaimer,
    submitText: s.submitText,
    status: s.status,
    questions: s.questions.map(toQuestion),
  };
}

export async function createSurvey(): Promise<string> {
  const s = await prisma.survey.create({
    data: { title: "Nueva encuesta", slug: `encuesta-${randomUUID().slice(0, 8)}` },
  });
  return s.id;
}

export async function saveSurvey(
  input: SurveyEditData,
): Promise<{ ok: boolean; error?: "slug" | "title" | "generic" }> {
  if (!input.title.trim()) return { ok: false, error: "title" };
  const slug = (input.slug.trim() ? slugify(input.slug) : slugify(input.title)).slice(0, 80);

  try {
    await prisma.$transaction(async (tx) => {
      await tx.survey.update({
        where: { id: input.id },
        data: {
          slug,
          title: input.title.trim(),
          description: input.description,
          disclaimer: input.disclaimer,
          submitText: input.submitText,
          status: input.status,
        },
      });

      const keepIds = input.questions.map((q) => q.id);
      await tx.surveyQuestion.deleteMany({
        where: { surveyId: input.id, id: { notIn: keepIds.length ? keepIds : ["__none__"] } },
      });

      for (const [i, q] of input.questions.entries()) {
        const data = {
          section: q.section,
          type: q.type,
          label: q.label,
          help: q.help,
          required: q.required,
          options: (q.options ?? {}) as Prisma.InputJsonValue,
          order: i,
        };
        await tx.surveyQuestion.upsert({
          where: { id: q.id },
          create: { id: q.id, surveyId: input.id, ...data },
          update: data,
        });
      }
    });
    return { ok: true };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, error: "slug" };
    }
    return { ok: false, error: "generic" };
  }
}

export async function deleteSurvey(id: string): Promise<void> {
  await prisma.survey.delete({ where: { id } });
}

// ── Export / Import ───────────────────────────────────────────

export async function exportSurvey(id: string): Promise<SurveyExportData | null> {
  const s = await prisma.survey.findUnique({
    where: { id },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!s) return null;
  return {
    _format: "mirutafit-survey-v1",
    slug: s.slug,
    title: s.title,
    description: s.description,
    disclaimer: s.disclaimer,
    submitText: s.submitText,
    status: s.status,
    questions: s.questions.map((q) => ({
      section: q.section,
      type: (QUESTION_TYPES.includes(q.type as QuestionType) ? q.type : "short_text") as QuestionType,
      label: q.label,
      help: q.help,
      required: q.required,
      options: (q.options as QuestionOptions) ?? {},
      order: q.order,
    })),
  };
}

export async function importSurvey(
  data: SurveyExportData,
): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (data._format !== "mirutafit-survey-v1") {
    return { ok: false, error: "format" };
  }
  if (!data.title?.trim()) {
    return { ok: false, error: "title" };
  }

  // Find a unique slug — append a suffix if it already exists.
  let slug = slugify(data.slug || data.title).slice(0, 80);
  const existing = await prisma.survey.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${randomUUID().slice(0, 6)}`;
  }

  try {
    const survey = await prisma.survey.create({
      data: {
        slug,
        title: data.title.trim(),
        description: data.description ?? "",
        disclaimer: data.disclaimer ?? "",
        submitText: data.submitText ?? "",
        status: "draft", // always import as draft for safety
        questions: {
          create: (data.questions ?? []).map((q, i) => ({
            section: q.section ?? "",
            type: (QUESTION_TYPES.includes(q.type as QuestionType) ? q.type : "short_text") as string,
            label: q.label ?? "",
            help: q.help ?? "",
            required: q.required ?? false,
            options: (q.options ?? {}) as Prisma.InputJsonValue,
            order: q.order ?? i,
          })),
        },
      },
    });
    return { ok: true, id: survey.id };
  } catch {
    return { ok: false, error: "generic" };
  }
}

// ── Public ────────────────────────────────────────────────────

/** Open surveys only (drafts/closed are not publicly answerable). */
export async function getPublicSurvey(slug: string): Promise<PublicSurvey | null> {
  const s = await prisma.survey.findFirst({
    where: { slug, status: "open" },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!s) return null;
  return {
    id: s.id,
    slug: s.slug,
    title: s.title,
    description: s.description,
    disclaimer: s.disclaimer,
    submitText: s.submitText,
    questions: s.questions.map(toQuestion),
  };
}

export async function submitSurveyResponse(
  slug: string,
  answers: { questionId: string; value: string }[],
): Promise<{ ok: boolean; error?: "closed" | "validation" }> {
  const survey = await prisma.survey.findFirst({
    where: { slug, status: "open" },
    include: { questions: true },
  });
  if (!survey) return { ok: false, error: "closed" };

  const byId = new Map(answers.map((a) => [a.questionId, (a.value ?? "").trim()]));
  // Required questions must have a non-empty answer.
  for (const q of survey.questions) {
    if (q.required && !byId.get(q.id)) return { ok: false, error: "validation" };
  }

  await prisma.surveyResponse.create({
    data: {
      surveyId: survey.id,
      answers: {
        create: survey.questions
          .filter((q) => byId.get(q.id))
          .map((q) => ({ questionId: q.id, value: byId.get(q.id)!.slice(0, 5000) })),
      },
    },
  });
  return { ok: true };
}

// ── Responses (admin) ─────────────────────────────────────────

export async function getSurveyResponses(id: string): Promise<{
  survey: { id: string; title: string; slug: string };
  questions: SurveyQuestionData[];
  responses: ResponseRow[];
} | null> {
  const s = await prisma.survey.findUnique({
    where: { id },
    include: {
      questions: { orderBy: { order: "asc" } },
      responses: { orderBy: { createdAt: "desc" }, include: { answers: true }, take: 500 },
    },
  });
  if (!s) return null;
  return {
    survey: { id: s.id, title: s.title, slug: s.slug },
    questions: s.questions.map(toQuestion),
    responses: s.responses.map((r) => ({
      id: r.id,
      createdAt: r.createdAt.toISOString(),
      values: Object.fromEntries(r.answers.map((a) => [a.questionId, a.value])),
    })),
  };
}
