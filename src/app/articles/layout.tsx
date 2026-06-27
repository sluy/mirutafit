import Navbar from "@/components/Navbar";
import FooterWidget from "@/widgets/footer/FooterWidget";
import { getNavbarConfig, getFooterConfig } from "@/lib/settings";
import { getMenuCategories } from "@/lib/taxonomy";
import { getLocale } from "next-intl/server";

/**
 * Public chrome for the Articles section: an in-flow navbar (readable on the
 * white listing/detail pages) + the configured footer.
 */
export default async function ArticlesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const [navbar, footer] = await Promise.all([getNavbarConfig(), getFooterConfig()]);
  const categories = await getMenuCategories(locale, navbar.menuCategories ?? []);

  // Force the "scrolled" palette as the base so text stays readable in flow.
  const navConfig = {
    ...navbar,
    fixed: false,
    topBg: navbar.scrolledBg,
    topText: navbar.scrolledText,
  };

  return (
    <>
      <Navbar config={navConfig} categories={categories} />
      <main className="flex-1">{children}</main>
      <FooterWidget config={footer} />
    </>
  );
}
