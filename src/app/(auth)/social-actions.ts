"use server";

import { getOauthSettings } from "@/lib/settings";

/** Which social providers are enabled (drives the login/register buttons). */
export async function getSocialLoginConfig(): Promise<{ google: boolean }> {
  const o = await getOauthSettings();
  return { google: o.googleEnabled && Boolean(o.googleClientId) };
}
