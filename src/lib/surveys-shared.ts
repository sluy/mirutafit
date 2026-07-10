/**
 * Client-safe survey types + constants (no Prisma / node imports). The DB
 * functions live in `surveys.ts` (server only) and re-export these.
 */
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
