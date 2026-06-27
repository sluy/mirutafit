import { getRequestConfig } from "next-intl/server";
import { headers } from "next/headers";
import { buildMessages } from "@/lib/translations";
import { detectRequestLocale } from "@/lib/locale";
import { auth } from "@/lib/auth";

// The signed-in account's saved language (used as a detection signal).
async function getAccountLanguage(): Promise<string | null> {
  // Read headers() OUTSIDE the try so its "dynamic rendering" signal propagates
  // (locale-aware pages must render per-request, not be prerendered at build).
  const h = await headers();
  try {
    const session = await auth.api.getSession({ headers: h });
    return (session?.user as { language?: string | null } | undefined)?.language ?? null;
  } catch {
    return null;
  }
}

export default getRequestConfig(async () => {
  const locale = await detectRequestLocale(await getAccountLanguage());
  return {
    locale,
    // Base messages with any admin overrides applied.
    messages: await buildMessages(locale),
  };
});
