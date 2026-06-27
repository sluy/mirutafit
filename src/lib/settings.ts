import { prisma } from "./prisma";

// ── SMTP ───────────────────────────────────────────────────────
// Stored in the `system_setting` table under the key "smtp".
// Used later to send transactional emails from an @mirutafit.com address.

export type SmtpSettings = {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  fromName: string;
  fromEmail: string;
};

export const SMTP_KEY = "smtp";

export const emptySmtp: SmtpSettings = {
  host: "",
  port: 587,
  secure: false,
  username: "",
  password: "",
  fromName: "MiRutaFit",
  fromEmail: "",
};

export async function getSmtpSettings(): Promise<SmtpSettings> {
  const row = await prisma.systemSetting.findUnique({ where: { key: SMTP_KEY } });
  if (!row) return emptySmtp;
  return { ...emptySmtp, ...(row.value as Partial<SmtpSettings>) };
}

export async function saveSmtpSettings(input: SmtpSettings): Promise<void> {
  await prisma.systemSetting.upsert({
    where: { key: SMTP_KEY },
    create: { key: SMTP_KEY, value: input },
    update: { value: input },
  });
}

// ── Registration ──────────────────────────────────────────────
// Whether new visitors can sign up. Stored under the key "registration".

export const REGISTRATION_KEY = "registration";

export async function getRegistrationEnabled(): Promise<boolean> {
  const row = await prisma.systemSetting.findUnique({
    where: { key: REGISTRATION_KEY },
  });
  // Default: registration is open.
  return (row?.value as { enabled?: boolean } | undefined)?.enabled !== false;
}

export async function setRegistrationEnabled(enabled: boolean): Promise<void> {
  await prisma.systemSetting.upsert({
    where: { key: REGISTRATION_KEY },
    create: { key: REGISTRATION_KEY, value: { enabled } },
    update: { value: { enabled } },
  });
}

// ── Verification code policy ───────────────────────────────────
// Controls how the reusable verification-code module generates one-time codes.
// Stored under the key "codePolicy". See src/lib/verification-codes.ts.

export type CodePolicy = {
  length: number; // number of characters
  useLetters: boolean; // include A-Z
  useNumbers: boolean; // include 0-9
  useSymbols: boolean; // include a small set of symbols
  expiryMinutes: number; // how long a code stays valid
  maxAttempts: number; // wrong tries before a code is locked
};

export const CODE_POLICY_KEY = "codePolicy";

export const defaultCodePolicy: CodePolicy = {
  length: 6,
  useLetters: false,
  useNumbers: true,
  useSymbols: false,
  expiryMinutes: 15,
  maxAttempts: 5,
};

export async function getCodePolicy(): Promise<CodePolicy> {
  const row = await prisma.systemSetting.findUnique({
    where: { key: CODE_POLICY_KEY },
  });
  if (!row) return defaultCodePolicy;
  return { ...defaultCodePolicy, ...(row.value as Partial<CodePolicy>) };
}

export async function saveCodePolicy(input: CodePolicy): Promise<void> {
  await prisma.systemSetting.upsert({
    where: { key: CODE_POLICY_KEY },
    create: { key: CODE_POLICY_KEY, value: input },
    update: { value: input },
  });
}

// ── Social Links ───────────────────────────────────────────────
// Stored as a JSON array under key "socialLinks".

export type SocialLink = {
  type: string; // "instagram" | "tiktok" | "facebook" | "twitter" | "youtube" | "whatsapp" | "phone" | "email" | "website" | "address"
  value: string;
};

export const SOCIAL_LINKS_KEY = "socialLinks";

export async function getSocialLinks(): Promise<SocialLink[]> {
  const row = await prisma.systemSetting.findUnique({
    where: { key: SOCIAL_LINKS_KEY },
  });
  return (row?.value as SocialLink[] | undefined) ?? [];
}

export async function saveSocialLinks(links: SocialLink[]): Promise<void> {
  await prisma.systemSetting.upsert({
    where: { key: SOCIAL_LINKS_KEY },
    create: { key: SOCIAL_LINKS_KEY, value: links },
    update: { value: links },
  });
}

// ── Site Settings (non-translatable) ──────────────────────────
// Things like canonical URL, favicon path, etc.

export type SiteSettings = {
  canonicalUrl: string;
  faviconUrl: string;
};

export const SITE_KEY = "site";

export const emptySiteSettings: SiteSettings = {
  canonicalUrl: "",
  faviconUrl: "",
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const row = await prisma.systemSetting.findUnique({
    where: { key: SITE_KEY },
  });
  if (!row) return emptySiteSettings;
  return { ...emptySiteSettings, ...(row.value as Partial<SiteSettings>) };
}

export async function saveSiteSettings(input: SiteSettings): Promise<void> {
  await prisma.systemSetting.upsert({
    where: { key: SITE_KEY },
    create: { key: SITE_KEY, value: input },
    update: { value: input },
  });
}

// ── Navbar Config (singleton widget) ──────────────────────────
// Stored under key "navbarConfig". Drives the public Navbar component.

import type { NavbarConfig, FooterConfig } from "@/widgets/types";
import { WIDGET_META } from "@/widgets/meta";

export const NAVBAR_CONFIG_KEY = "navbarConfig";

const defaultNavbar = WIDGET_META.navbar.defaultConfig as NavbarConfig;

export async function getNavbarConfig(): Promise<NavbarConfig> {
  const row = await prisma.systemSetting.findUnique({
    where: { key: NAVBAR_CONFIG_KEY },
  });
  if (!row) return defaultNavbar;
  return { ...defaultNavbar, ...(row.value as Partial<NavbarConfig>) };
}

export async function saveNavbarConfig(input: NavbarConfig): Promise<void> {
  await prisma.systemSetting.upsert({
    where: { key: NAVBAR_CONFIG_KEY },
    create: { key: NAVBAR_CONFIG_KEY, value: input },
    update: { value: input },
  });
}

// ── Footer Config (singleton widget) ──────────────────────────
// Stored under key "footerConfig". Drives the public Footer component.

export const FOOTER_CONFIG_KEY = "footerConfig";

const defaultFooter = WIDGET_META.footer.defaultConfig as FooterConfig;

export async function getFooterConfig(): Promise<FooterConfig> {
  const row = await prisma.systemSetting.findUnique({
    where: { key: FOOTER_CONFIG_KEY },
  });
  if (!row) return defaultFooter;
  return { ...defaultFooter, ...(row.value as Partial<FooterConfig>) };
}

export async function saveFooterConfig(input: FooterConfig): Promise<void> {
  await prisma.systemSetting.upsert({
    where: { key: FOOTER_CONFIG_KEY },
    create: { key: FOOTER_CONFIG_KEY, value: input },
    update: { value: input },
  });
}

// ── Contact settings ──────────────────────────────────────────
// Where contact-form notifications are delivered and which address they are
// sent from. Stored under key "contact". The recipient + sender are admin-
// configurable (the SMTP account still does the actual delivery).

export type ContactSettings = {
  recipientEmail: string; // where new-message notifications are delivered
  fromEmail: string; // From address used for contact notifications
  fromName: string; // From display name
  notify: boolean; // send an email when a new message arrives
};

export const CONTACT_KEY = "contact";

export const defaultContactSettings: ContactSettings = {
  recipientEmail: "sluy1283@gmail.com",
  fromEmail: "contacto@mirutafit.com",
  fromName: "MiRutaFit",
  notify: true,
};

export async function getContactSettings(): Promise<ContactSettings> {
  const row = await prisma.systemSetting.findUnique({ where: { key: CONTACT_KEY } });
  if (!row) return defaultContactSettings;
  return { ...defaultContactSettings, ...(row.value as Partial<ContactSettings>) };
}

export async function saveContactSettings(input: ContactSettings): Promise<void> {
  await prisma.systemSetting.upsert({
    where: { key: CONTACT_KEY },
    create: { key: CONTACT_KEY, value: input },
    update: { value: input },
  });
}

// ── Community settings ────────────────────────────────────────
// Moderation policy for visitor comments. Stored under key "community".

export type CommunitySettings = {
  autoApprove: boolean; // publish new comments immediately (post-moderation)
};

export const COMMUNITY_KEY = "community";

export const defaultCommunitySettings: CommunitySettings = {
  autoApprove: false,
};

export async function getCommunitySettings(): Promise<CommunitySettings> {
  const row = await prisma.systemSetting.findUnique({ where: { key: COMMUNITY_KEY } });
  if (!row) return defaultCommunitySettings;
  return { ...defaultCommunitySettings, ...(row.value as Partial<CommunitySettings>) };
}

export async function saveCommunitySettings(input: CommunitySettings): Promise<void> {
  await prisma.systemSetting.upsert({
    where: { key: COMMUNITY_KEY },
    create: { key: COMMUNITY_KEY, value: input },
    update: { value: input },
  });
}

// ── OAuth / social login ──────────────────────────────────────
// Google credentials + enable flag, stored under key "oauth". The secret is
// sensitive (treated like the SMTP password — never echoed back to the client).
// NOTE: better-auth reads provider credentials at startup, so changing the
// client id/secret requires a server restart to take effect. The enable toggle
// controls the button live.

export type OauthSettings = {
  googleEnabled: boolean;
  googleClientId: string;
  googleClientSecret: string;
};

export const OAUTH_KEY = "oauth";

export const defaultOauthSettings: OauthSettings = {
  googleEnabled: false,
  googleClientId: "",
  googleClientSecret: "",
};

export async function getOauthSettings(): Promise<OauthSettings> {
  try {
    const row = await prisma.systemSetting.findUnique({ where: { key: OAUTH_KEY } });
    if (!row) return defaultOauthSettings;
    return { ...defaultOauthSettings, ...(row.value as Partial<OauthSettings>) };
  } catch {
    return defaultOauthSettings;
  }
}

export async function saveOauthSettings(input: OauthSettings): Promise<void> {
  await prisma.systemSetting.upsert({
    where: { key: OAUTH_KEY },
    create: { key: OAUTH_KEY, value: input },
    update: { value: input },
  });
}

// ── Locale settings ───────────────────────────────────────────
// Controls which languages the public site offers and how the active one is
// chosen. Stored under key "locale". See src/lib/locale.ts.

export type LocaleSettings = {
  mode: "single" | "multi"; // one forced language, or several (auto-detected)
  single: string; // the language used when mode = "single"
  enabled: string[]; // enabled languages when mode = "multi"
  fallback: string; // default when detection finds nothing enabled
};

export const LOCALE_KEY = "locale";

export const defaultLocaleSettings: LocaleSettings = {
  mode: "multi",
  single: "en",
  enabled: ["en", "es"],
  fallback: "en",
};

export async function getLocaleSettings(): Promise<LocaleSettings> {
  const row = await prisma.systemSetting.findUnique({ where: { key: LOCALE_KEY } });
  if (!row) return defaultLocaleSettings;
  return { ...defaultLocaleSettings, ...(row.value as Partial<LocaleSettings>) };
}

export async function saveLocaleSettings(input: LocaleSettings): Promise<void> {
  await prisma.systemSetting.upsert({
    where: { key: LOCALE_KEY },
    create: { key: LOCALE_KEY, value: input },
    update: { value: input },
  });
}
