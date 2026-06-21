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
