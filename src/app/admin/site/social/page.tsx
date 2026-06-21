import { getTranslations } from "next-intl/server";
import { getSocialLinks } from "@/lib/settings";
import SocialLinksEditor from "@/components/admin/SocialLinksEditor";

export default async function SiteSocialPage() {
  const t = await getTranslations("admin.siteSocial");
  const links = await getSocialLinks();

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl font-extrabold text-ink">{t("title")}</h1>
        <p className="mt-1 text-ink/60">{t("subtitle")}</p>
      </header>

      <SocialLinksEditor initialLinks={links} />
    </div>
  );
}
