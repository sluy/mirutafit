import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { defaultLocale, isLocale, LOCALE_COOKIE, type Locale } from "./config";
import { buildMessages } from "@/lib/translations";

// Decide the language for the current request:
// 1. A manual choice saved in the NEXT_LOCALE cookie wins.
// 2. Otherwise we sniff the Accept-Language header: Spanish -> "es",
//    anything else falls back to English (the base language).
async function resolveLocale(): Promise<Locale> {
  const cookieLocale = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(cookieLocale)) return cookieLocale;

  const acceptLanguage = (await headers()).get("accept-language") ?? "";
  if (acceptLanguage.toLowerCase().includes("es")) return "es";

  return defaultLocale;
}

export default getRequestConfig(async () => {
  const locale = await resolveLocale();
  return {
    locale,
    // Base messages with any admin overrides applied.
    messages: await buildMessages(locale),
  };
});
