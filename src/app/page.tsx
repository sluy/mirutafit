import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Sponsors from "@/components/Sponsors";
import Posts from "@/components/Posts";
import Community from "@/components/Community";
import Support from "@/components/Support";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import PageRenderer from "@/components/PageRenderer";
import { getOrCreatePage, pageLayout, getLayoutWidgets } from "@/lib/pages";
import { getNavbarConfig, getFooterConfig, getSocialLinks } from "@/lib/settings";

export default async function Home() {
  const [page, navbarConfig, footerConfig, social] = await Promise.all([
    getOrCreatePage("home", "Home"),
    getNavbarConfig(),
    getFooterConfig(),
    getSocialLinks(),
  ]);

  const layout = pageLayout(page);
  const hasLayout = layout.rows.length > 0;
  const widgets = hasLayout ? await getLayoutWidgets(layout) : {};

  return (
    <>
      {navbarConfig.enabled && <Navbar config={navbarConfig} social={social} />}
      <main className="flex-1">
        {hasLayout ? (
          // Composed from the admin layout builder.
          <PageRenderer layout={layout} widgets={widgets} />
        ) : (
          // Default home until a layout is composed (gradual migration).
          <>
            <Hero />
            <About />
            <Sponsors />
            <Posts />
            <Community />
            <Support />
            <Contact />
          </>
        )}
      </main>
      {footerConfig.enabled && <Footer config={footerConfig} social={social} />}
    </>
  );
}
