import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";

// Builds a one-file PDF of a survey response with pdf-lib (pure JS, no native
// deps or font files — safe under `output: standalone`). Layout is done by hand:
// wrapping and pagination over the built-in Helvetica. See docs/notifications.md.

export type SurveyPdfItem = { question: string; answer: string };

export type SurveyPdfInput = {
  surveyTitle: string;
  answeredAt: Date;
  items: SurveyPdfItem[];
};

// Standard Helvetica uses WinAnsi encoding: Latin-1 (incl. áéíóúñ¿¡) is fine, but
// anything above it (smart quotes, em dash, emoji) throws on draw. Normalize the
// common typographic characters and drop anything outside printable Latin-1,
// while keeping newlines so wrapping can honor them.
function sanitize(s: string): string {
  return (s || "")
    .replace(/[‘’‚′]/g, "'")
    .replace(/[“”„″]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .replace(/ /g, " ")
    // eslint-disable-next-line no-control-regex
    .replace(/[^\n -ÿ]/g, "");
}

/** Split a string into lines that fit `maxWidth` at `size`, honoring \n. */
function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const out: string[] = [];
  for (const rawLine of sanitize(text).split("\n")) {
    if (rawLine === "") {
      out.push("");
      continue;
    }
    let line = "";
    for (const word of rawLine.split(/\s+/).filter(Boolean)) {
      const candidate = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
        line = candidate;
      } else {
        if (line) out.push(line);
        // Hard-break a single word longer than the column.
        if (font.widthOfTextAtSize(word, size) > maxWidth) {
          let chunk = "";
          for (const ch of word) {
            if (font.widthOfTextAtSize(chunk + ch, size) > maxWidth) {
              out.push(chunk);
              chunk = ch;
            } else chunk += ch;
          }
          line = chunk;
        } else {
          line = word;
        }
      }
    }
    out.push(line);
  }
  return out;
}

export async function buildSurveyResponsePdf(input: SurveyPdfInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const PAGE_W = 595.28;
  const PAGE_H = 841.89;
  const MARGIN = 50;
  const CONTENT_W = PAGE_W - MARGIN * 2;
  const brand = rgb(0.06, 0.72, 0.51);
  const ink = rgb(0.06, 0.09, 0.13);
  const muted = rgb(0.42, 0.45, 0.5);

  let page = doc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;

  const ensure = (needed: number) => {
    if (y - needed < MARGIN) {
      page = doc.addPage([PAGE_W, PAGE_H]);
      y = PAGE_H - MARGIN;
    }
  };

  const drawLines = (
    text: string,
    f: PDFFont,
    size: number,
    color: ReturnType<typeof rgb>,
    lineGap = 4,
  ) => {
    for (const line of wrap(text, f, size, CONTENT_W)) {
      ensure(size + lineGap);
      if (line) page.drawText(line, { x: MARGIN, y: y - size, size, font: f, color });
      y -= size + lineGap;
    }
  };

  // ── Header: survey title + answered date/time ──
  drawLines(input.surveyTitle || "Encuesta", bold, 20, ink, 6);
  y -= 2;
  const stamp = input.answeredAt.toLocaleString("es-ES", {
    dateStyle: "long",
    timeStyle: "short",
  });
  drawLines(`Respondida el ${stamp}`, font, 11, muted, 4);
  y -= 8;
  page.drawRectangle({ x: MARGIN, y, width: CONTENT_W, height: 2, color: brand });
  y -= 22;

  // ── Body: each question then its answer ──
  for (const item of input.items) {
    ensure(40);
    drawLines(item.question, bold, 12, ink, 4);
    y -= 2;
    drawLines(item.answer || "—", font, 11, muted, 4);
    y -= 12;
  }

  return doc.save();
}
