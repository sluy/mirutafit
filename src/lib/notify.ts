import { prisma } from "./prisma";
import { sendTelegramMessage, sendTelegramDocument, tgHtml } from "./telegram";
import { buildSurveyResponsePdf, type SurveyPdfItem } from "./survey-pdf";
import type { GeoInfo } from "./geo";
import { parseUserAgent, flagEmoji, refererHost } from "./user-agent";

// Orchestrates the "someone visited / responded" Telegram notifications. Every
// function here is best-effort and never throws: a failure is logged and
// swallowed so it can't break a page view or a survey submission.
// See docs/notifications.md.

export type VisitorInfo = {
  ip?: string;
  country?: string; // ISO code fallback from a proxy header (e.g. cf-ipcountry)
  userAgent?: string;
  referer?: string;
  geo?: GeoInfo | null; // pre-resolved geolocation (from geolocate())
};

/** Extract anecdotal visitor data from request headers (all best-effort). */
export function visitorFromHeaders(h: Headers): VisitorInfo {
  const fwd = h.get("x-forwarded-for");
  const ip = (fwd?.split(",")[0] || h.get("x-real-ip") || "").trim() || undefined;
  const country =
    h.get("cf-ipcountry") || h.get("x-vercel-ip-country") || undefined;
  const userAgent = h.get("user-agent") || undefined;
  const referer = h.get("referer") || undefined;
  return { ip, country: country || undefined, userAgent, referer };
}

/**
 * Multi-line footer with the same anecdotal detail shown in the admin visit
 * history: location (city/region/country + flag), browser/OS, source, IP.
 * Only includes the fields we actually have.
 */
function visitorFooter(v?: VisitorInfo): string {
  if (!v) return "";
  const lines: string[] = [];

  const cc = v.geo?.countryCode || v.country || "";
  const flag = flagEmoji(cc);
  const locParts = v.geo
    ? [v.geo.city, v.geo.region, v.geo.country].filter(Boolean)
    : [];
  const locLabel = locParts.length ? locParts.join(", ") : v.country || "";
  if (locLabel) lines.push(`📍 ${locLabel}${flag ? " " + flag : ""}`);
  else if (flag) lines.push(`📍 ${flag}`);

  if (v.userAgent) {
    const ua = parseUserAgent(v.userAgent);
    lines.push(`🌐 ${ua.browser} · ${ua.os}`);
  }

  const host = refererHost(v.referer || "");
  if (host) lines.push(`🔗 ${host}`);

  if (v.ip) lines.push(`🖥 ${v.ip}`);

  if (lines.length === 0) return "";
  return `\n<i>${tgHtml(lines.join("\n"))}</i>`;
}

/**
 * Notify a visit for a view key. Handles both `survey:<id>` (from /api/views)
 * and `page:<slug>` (from the static route handler). Only fires if the entity
 * has its notify flag on. Unknown keys (page:home, article:*) are ignored.
 */
export async function notifyView(key: string, visitor?: VisitorInfo): Promise<void> {
  try {
    const survey = key.startsWith("survey:") ? key.slice(7) : "";
    const pageSlug = key.startsWith("page:") ? key.slice(5) : "";

    if (survey) {
      const s = await prisma.survey.findUnique({
        where: { id: survey },
        select: { title: true, notifyViews: true },
      });
      if (!s?.notifyViews) return;
      await sendTelegramMessage(
        `👀 Se acaba de visitar la encuesta <b>${tgHtml(s.title)}</b>` +
          visitorFooter(visitor),
      );
      return;
    }

    if (pageSlug) {
      const p = await prisma.staticPage.findFirst({
        where: { slug: pageSlug },
        select: { title: true, slug: true, notifyViews: true },
      });
      if (!p?.notifyViews) return;
      const name = p.title || p.slug;
      await sendTelegramMessage(
        `📄 Se acaba de visitar la página estática: <b>${tgHtml(name)}</b>` +
          visitorFooter(visitor),
      );
    }
  } catch {
    // best-effort — never surface notification failures to the visitor
  }
}

/** Pick a person name from the answers (first "nombre"/"name" question), else Anónimo. */
function personName(items: { label: string; answer: string }[]): string {
  const hit = items.find(
    (i) => /nombre|name/i.test(i.label) && i.answer.trim(),
  );
  return hit?.answer.trim() || "Anónimo";
}

/** Sanitize a string for use inside a filename. */
function fileSafe(s: string): string {
  return s.replace(/[\\/:*?"<>|\n\r]+/g, " ").replace(/\s+/g, " ").trim() || "sin-nombre";
}

export type SurveyResponseNotice = {
  surveyTitle: string;
  answeredAt: Date;
  items: { label: string; answer: string }[]; // in question order
  visitor?: VisitorInfo;
};

/**
 * Notify a survey response: a text message plus a PDF of the answers attached
 * as a document. Filename: "YYYY-MM-DD - <survey> - <person>.pdf".
 */
export async function notifySurveyResponse(n: SurveyResponseNotice): Promise<void> {
  try {
    const person = personName(n.items);
    const pdfItems: SurveyPdfItem[] = n.items.map((i) => ({
      question: i.label,
      answer: i.answer,
    }));
    const pdf = await buildSurveyResponsePdf({
      surveyTitle: n.surveyTitle,
      answeredAt: n.answeredAt,
      items: pdfItems,
    });

    const ymd = n.answeredAt.toISOString().slice(0, 10);
    const filename = `${ymd} - ${fileSafe(n.surveyTitle)} - ${fileSafe(person)}.pdf`;

    const caption =
      `📝 Se acaba de responder la encuesta <b>${tgHtml(n.surveyTitle)}</b>` +
      (person !== "Anónimo" ? `\nPor: ${tgHtml(person)}` : "") +
      visitorFooter(n.visitor);

    await sendTelegramDocument(pdf, filename, caption);
  } catch {
    // best-effort — a notification failure must not break the submission
  }
}
