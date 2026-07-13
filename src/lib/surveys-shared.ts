/**
 * Client-safe survey types + constants (no Prisma / node imports). The DB
 * functions live in `surveys.ts` (server only) and re-export these.
 */

// The intro/disclaimer/thank-you fields hold rich HTML (edited with the app's
// WYSIWYG editor). Legacy surveys may still hold plain text — these helpers let
// callers render both safely.

/** True if the string contains an HTML tag (vs. legacy plain text). */
export function looksLikeHtml(s: string): boolean {
  return /<[a-z!/][\s\S]*>/i.test(s);
}

/** Strip tags/entities to plain text (for meta descriptions, previews, checks). */
export function stripHtml(s: string): string {
  return (s || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/** True if the (possibly HTML) value has any visible content. */
export function htmlHasContent(s: string): boolean {
  return stripHtml(s).length > 0;
}

export type QuestionType =
  | "short_text"
  | "long_text"
  | "single_choice"
  | "multiple_choice"
  | "scale"
  | "number";

export const QUESTION_TYPES: QuestionType[] = [
  "short_text",
  "long_text",
  "single_choice",
  "multiple_choice",
  "scale",
  "number",
];

export type QuestionOptions = {
  choices?: string[]; // single_choice / multiple_choice
  min?: number; // scale
  max?: number; // scale
  minLabel?: string; // scale
  maxLabel?: string; // scale
};

export type SurveyQuestionData = {
  id: string;
  section: string;
  type: QuestionType;
  label: string;
  help: string;
  required: boolean;
  options: QuestionOptions;
  order: number;
};

export type SurveyEditData = {
  id: string;
  slug: string;
  title: string;
  description: string;
  disclaimer: string;
  submitText: string;
  status: string;
  notifyViews: boolean;
  notifyResponses: boolean;
  questions: SurveyQuestionData[];
};

export type SurveyListItem = {
  id: string;
  slug: string;
  title: string;
  status: string;
  questionCount: number;
  responseCount: number;
};

export type PublicSurvey = {
  id: string;
  slug: string;
  title: string;
  description: string;
  disclaimer: string;
  submitText: string;
  questions: SurveyQuestionData[];
};

export type ResponseRow = {
  id: string;
  createdAt: string;
  values: Record<string, string>; // questionId -> value
};

/** Portable format for survey import/export (no internal IDs). */
export type SurveyExportData = {
  _format: "mirutafit-survey-v1";
  slug: string;
  title: string;
  description: string;
  disclaimer: string;
  submitText: string;
  status: string;
  questions: {
    section: string;
    type: QuestionType;
    label: string;
    help: string;
    required: boolean;
    options: QuestionOptions;
    order: number;
  }[];
};
