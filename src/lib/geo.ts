// Best-effort IP geolocation for anecdotal visit stats. Server-side, silent
// (no browser permission prompt). Uses ipwho.is (free, HTTPS, no API key).
// Never throws — returns null on any problem. Private/local IPs are skipped.

export type GeoInfo = {
  country: string; // "Venezuela"
  countryCode: string; // "VE"
  region: string; // "Distrito Capital"
  city: string; // "Caracas"
};

/** True for empty / loopback / private / reserved addresses we can't geolocate. */
function isPrivateIp(ip: string): boolean {
  if (!ip) return true;
  if (ip === "::1" || ip.startsWith("127.") || ip.startsWith("0.")) return true;
  if (ip.startsWith("10.") || ip.startsWith("192.168.")) return true;
  // 172.16.0.0 – 172.31.255.255
  const m = /^172\.(\d+)\./.exec(ip);
  if (m && Number(m[1]) >= 16 && Number(m[1]) <= 31) return true;
  // IPv6 unique-local / link-local
  if (/^(fc|fd|fe80)/i.test(ip)) return true;
  return false;
}

export async function geolocate(ip: string): Promise<GeoInfo | null> {
  if (isPrivateIp(ip)) return null;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 3500);
    const res = await fetch(
      `https://ipwho.is/${encodeURIComponent(ip)}?fields=success,country,country_code,region,city`,
      { signal: ctrl.signal },
    );
    clearTimeout(timer);
    if (!res.ok) return null;
    const d = (await res.json()) as {
      success?: boolean;
      country?: string;
      country_code?: string;
      region?: string;
      city?: string;
    };
    if (!d.success) return null;
    return {
      country: d.country || "",
      countryCode: d.country_code || "",
      region: d.region || "",
      city: d.city || "",
    };
  } catch {
    return null;
  }
}
