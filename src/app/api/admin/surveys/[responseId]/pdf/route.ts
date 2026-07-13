import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { buildSurveyResponsePdf } from "@/lib/survey-pdf";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ responseId: string }> },
) {
  await requireAdmin();
  const { responseId } = await params;

  const response = await prisma.surveyResponse.findUnique({
    where: { id: responseId },
    include: {
      survey: { select: { title: true } },
      answers: {
        include: { question: { select: { id: true, label: true, order: true, type: true, options: true } } },
      },
    },
  });

  if (!response) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // Sort answers by question order
  const sorted = [...response.answers].sort(
    (a, b) => a.question.order - b.question.order,
  );

  const items = sorted.map((a) => ({
    question: a.question.label,
    answer: a.value,
  }));

  const pdf = await buildSurveyResponsePdf({
    surveyTitle: response.survey.title,
    answeredAt: response.createdAt,
    items,
  });

  // Filename: YYYYMMDD-Encuesta.pdf (date in Venezuela time)
  const ven = response.createdAt.toLocaleDateString("sv-SE", {
    timeZone: "America/Caracas",
  }); // sv-SE gives YYYY-MM-DD
  const ymd = ven.replace(/-/g, "");
  const safeName = response.survey.title
    .replace(/[\\/:*?"<>|\n\r]+/g, " ")
    .replace(/\s+/g, " ")
    .trim() || "Encuesta";
  const filename = `${ymd}-${safeName}.pdf`;

  return new NextResponse(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
