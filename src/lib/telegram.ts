import { getTelegramSettings } from "./settings";

// Thin wrapper around the Telegram Bot HTTP API. No SDK, no webhook: we are the
// caller. Everything here is best-effort — a failure is logged and swallowed so
// it never breaks a page view or a survey submission. See docs/notifications.md.

const API = "https://api.telegram.org";

/** Escape text for Telegram's HTML parse mode. */
export function tgHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function config(): Promise<{ token: string; chatId: string } | null> {
  const s = await getTelegramSettings();
  if (!s.enabled || !s.botToken || !s.chatId) return null;
  return { token: s.botToken, chatId: s.chatId };
}

/**
 * Send a plain/HTML text message. Returns { ok, error } so callers that want to
 * surface the failure (e.g. the "test" button) can; view/response hooks ignore it.
 */
export async function sendTelegramMessage(
  text: string,
): Promise<{ ok: boolean; error?: string }> {
  const cfg = await config();
  if (!cfg) return { ok: false, error: "not_configured" };
  return send(cfg.token, cfg.chatId, text);
}

/** Same as sendTelegramMessage but with explicit credentials (used by the test button). */
export async function sendTelegramMessageWith(
  token: string,
  chatId: string,
  text: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!token || !chatId) return { ok: false, error: "not_configured" };
  return send(token, chatId, text);
}

async function send(
  token: string,
  chatId: string,
  text: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${API}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
    const data = (await res.json().catch(() => null)) as
      | { ok?: boolean; description?: string }
      | null;
    if (!res.ok || !data?.ok) {
      return { ok: false, error: data?.description || `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "network_error" };
  }
}

/**
 * Send a document (the survey-response PDF) with an optional caption, as
 * multipart/form-data. Best-effort.
 */
export async function sendTelegramDocument(
  file: Uint8Array,
  filename: string,
  caption?: string,
): Promise<{ ok: boolean; error?: string }> {
  const cfg = await config();
  if (!cfg) return { ok: false, error: "not_configured" };
  try {
    const form = new FormData();
    form.append("chat_id", cfg.chatId);
    if (caption) {
      form.append("caption", caption);
      form.append("parse_mode", "HTML");
    }
    // Copy into a fresh ArrayBuffer-backed Blob so the type is unambiguous.
    const blob = new Blob([new Uint8Array(file)], { type: "application/pdf" });
    form.append("document", blob, filename);

    const res = await fetch(`${API}/bot${cfg.token}/sendDocument`, {
      method: "POST",
      body: form,
    });
    const data = (await res.json().catch(() => null)) as
      | { ok?: boolean; description?: string }
      | null;
    if (!res.ok || !data?.ok) {
      return { ok: false, error: data?.description || `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "network_error" };
  }
}
