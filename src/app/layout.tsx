import type { Metadata } from "next";
import { headers } from "next/headers";
import { Inter, Poppins } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import Toaster from "@/components/Toaster";
import TopLoader from "@/components/TopLoader";
import MaintenanceScreen from "@/components/MaintenanceScreen";
import { getMaintenanceSettings } from "@/lib/settings";
import { getSessionUser, isAdmin } from "@/lib/auth-guard";
import "./globals.css";

// Paths that stay reachable during maintenance (surveys + auth/admin/api).
const MAINTENANCE_EXEMPT = ["/encuestas", "/admin", "/login", "/register", "/forgot-password", "/api", "/media"];

async function maintenanceScreen(): Promise<React.ReactNode | null> {
  const m = await getMaintenanceSettings();
  if (!m.enabled) return null;
  const path = (await headers()).get("x-pathname") ?? "";
  if (MAINTENANCE_EXEMPT.some((p) => path.startsWith(p))) return null;
  if (isAdmin(await getSessionUser())) return null;
  return <MaintenanceScreen title={m.title} message={m.message} />;
}

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("site");

  const title = t("title");
  const description = t("description");
  const keywords = t("keywords")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  return {
    title,
    description,
    keywords,
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      type: "website",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const maintenance = await maintenanceScreen();

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${poppins.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-white text-ink">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <TopLoader />
          {maintenance ?? children}
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
