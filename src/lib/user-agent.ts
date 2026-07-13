// Tiny, dependency-free user-agent parser + flag helper for the visit history
// table. Deliberately approximate — this is anecdotal analytics, not fingerprinting.

export type UaInfo = { browser: string; os: string };

export function parseUserAgent(ua: string): UaInfo {
  const s = ua || "";

  // Browser — order matters (Edge/Brave/Opera masquerade as Chrome).
  let browser = "Desconocido";
  if (/Edg[A-Z]?\//.test(s)) browser = "Edge";
  else if (/OPR\/|Opera/.test(s)) browser = "Opera";
  else if (/SamsungBrowser/.test(s)) browser = "Samsung Internet";
  else if (/Firefox\/|FxiOS/.test(s)) browser = "Firefox";
  else if (/Chrome\/|CriOS/.test(s)) browser = "Chrome";
  else if (/Safari\//.test(s) && /Version\//.test(s)) browser = "Safari";
  else if (/MSIE|Trident/.test(s)) browser = "Internet Explorer";
  else if (/bot|crawler|spider|crawling/i.test(s)) browser = "Bot";

  // OS
  let os = "Desconocido";
  if (/Windows NT 10/.test(s)) os = "Windows";
  else if (/Windows/.test(s)) os = "Windows";
  else if (/iPhone|iPad|iPod/.test(s)) os = "iOS";
  else if (/Android/.test(s)) os = "Android";
  else if (/Mac OS X|Macintosh/.test(s)) os = "macOS";
  else if (/Linux/.test(s)) os = "Linux";

  return { browser, os };
}

/** Convert a 2-letter ISO country code to its flag emoji ("VE" → "🇻🇪"). */
export function flagEmoji(countryCode: string): string {
  const cc = (countryCode || "").trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(cc)) return "";
  const A = 0x1f1e6; // regional indicator "A"
  return String.fromCodePoint(A + (cc.charCodeAt(0) - 65), A + (cc.charCodeAt(1) - 65));
}

/** Just the host of a referer URL, or "" ("https://instagram.com/x" → "instagram.com"). */
export function refererHost(referer: string): string {
  if (!referer) return "";
  try {
    return new URL(referer).host;
  } catch {
    return "";
  }
}
