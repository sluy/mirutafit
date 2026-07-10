-- CreateTable
CREATE TABLE "survey" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "disclaimer" TEXT NOT NULL DEFAULT '',
    "submitText" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "survey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "survey_question" (
    "id" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "section" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "help" TEXT NOT NULL DEFAULT '',
    "required" BOOLEAN NOT NULL DEFAULT false,
    "options" JSONB NOT NULL DEFAULT '{}',
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "survey_question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "survey_response" (
    "id" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "survey_response_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "survey_answer" (
    "id" TEXT NOT NULL,
    "responseId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "value" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "survey_answer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "survey_slug_key" ON "survey"("slug");

-- CreateIndex
CREATE INDEX "survey_question_surveyId_idx" ON "survey_question"("surveyId");

-- CreateIndex
CREATE INDEX "survey_response_surveyId_idx" ON "survey_response"("surveyId");

-- CreateIndex
CREATE INDEX "survey_answer_responseId_idx" ON "survey_answer"("responseId");

-- AddForeignKey
ALTER TABLE "survey_question" ADD CONSTRAINT "survey_question_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "survey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_response" ADD CONSTRAINT "survey_response_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "survey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_answer" ADD CONSTRAINT "survey_answer_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "survey_response"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_answer" ADD CONSTRAINT "survey_answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "survey_question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
