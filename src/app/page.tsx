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
import ViewCounter from "@/components/ViewCounter";
import { getOrCreatePage, pageLayout, getLayoutWidgets } from "@/lib/pages";
import { getSocialLinks } from "@/lib/settings";
import { WIDGET_META } from "@/widgets/meta";
import type { NavbarConfig, FooterConfig } from "@/widgets/types";

export default async function Home() {
  const page = await getOrCreatePage("home", "Home");
  const layout = pageLayout(page);

  // Composed from the admin layout builder: everything (navbar, social bar,
  // footer, ...) comes from the placed widgets.
  if (layout.rows.length > 0) {
    const widgets = await getLayoutWidgets(layout);
    return (
      <main className="flex-1">
        <ViewCounter viewKey="page:home" />
        <PageRenderer layout={layout} widgets={widgets} />
      </main>
    );
  }

  // Default home until a layout is composed (gradual migration).
  const social = await getSocialLinks();
  return (
    <>
      <ViewCounter viewKey="page:home" />
      <div className="fixed inset-x-0 top-0 z-50">
        <Navbar config={WIDGET_META.navbar.defaultConfig as NavbarConfig} />
      </div>
      <main className="flex-1">
        <Hero />
        <About />
        <Sponsors />
        <Posts />
        <Community />
        <Support />
        <Contact />
      </main>
      <Footer config={WIDGET_META.footer.defaultConfig as FooterConfig} social={social} />
    </>
  );
}
