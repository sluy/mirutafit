import { getSocialLinks } from "@/lib/settings";
import Footer from "@/components/Footer";
import type { FooterConfig } from "../types";

/** Frontend render for the Footer widget. Server component (loads links). */
export default async function FooterWidget({ config }: { config: FooterConfig }) {
  const social = await getSocialLinks();
  return <Footer config={config} social={social} />;
}
