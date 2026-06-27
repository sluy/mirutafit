import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { HeartIcon, MailIcon } from "./icons";
import { SocialIconLinks } from "./SocialIconLinks";
import SmoothLink from "./SmoothLink";
import { resolveText } from "@/widgets/i18n";
import type { FooterConfig, FooterColumn, FooterLink } from "@/widgets/types";
import type { SocialLink } from "@/lib/settings";

const linkHref = (l: FooterLink) =>
  l.type === "widget" && l.widgetId ? `#w-${l.widgetId}` : l.url || "#";

export default async function Footer({
  config,
  social,
}: {
  config: FooterConfig;
  social: SocialLink[];
}) {
  const locale = await getLocale();
  const t = await getTranslations("footer");
  const tagline = resolveText(config.tagline, locale);

  // Footers saved before the builder existed fall back to translated defaults.
  const legacyColumns: FooterColumn[] = [
    {
      id: "nav",
      title: t("navTitle"),
      links: [
        { id: "home", type: "link", label: t("links.home"), url: "/", widgetId: "" },
        { id: "about", type: "link", label: t("links.about"), url: "#sobre-mi", widgetId: "" },
        { id: "blog", type: "link", label: t("links.blog"), url: "/articles", widgetId: "" },
        { id: "comm", type: "link", label: t("links.community"), url: "#comunidad", widgetId: "" },
      ],
    },
    {
      id: "res",
      title: t("resourcesTitle"),
      links: [
        { id: "sponsors", type: "link", label: t("links.sponsors"), url: "#sponsors", widgetId: "" },
        { id: "support", type: "link", label: t("links.support"), url: "#apoyo", widgetId: "" },
        { id: "contact", type: "link", label: t("links.contact"), url: "#contacto", widgetId: "" },
        { id: "login", type: "link", label: t("links.login"), url: "/login", widgetId: "" },
      ],
    },
  ];
  const columns = config.columns?.length ? config.columns : legacyColumns;

  const newsletterTitle = resolveText(config.newsletterTitle, locale) || t("newsletterTitle");
  const newsletterText = resolveText(config.newsletterText, locale) || t("newsletterText");
  const copyright = resolveText(config.copyright, locale) || t("rights");
  const madeWith = resolveText(config.madeWith, locale);

  return (
    <footer className="bg-ink text-white/70">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className={`grid gap-10 ${config.showNewsletter ? "lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]" : "lg:grid-cols-[1.5fr_1fr_1fr]"}`}>
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 font-display text-2xl font-extrabold text-white">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand">
                <HeartIcon width={18} height={18} />
              </span>
              <span>Mi<span className="text-brand">Ruta</span>Fit</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed">{tagline}</p>
            {config.showSocial && social.length > 0 && (
              <div className="mt-6 flex gap-3">
                <SocialIconLinks
                  links={social}
                  size={18}
                  className="grid h-10 w-10 place-items-center rounded-full bg-white/5 text-white/70 transition-colors hover:bg-brand hover:text-white"
                />
              </div>
            )}
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.id}>
              <h4 className="font-display font-bold text-white">{resolveText(col.title, locale)}</h4>
              <ul className="mt-4 space-y-3 text-sm">
                {col.links.map((l) => (
                  <li key={l.id}>
                    <SmoothLink href={linkHref(l)} className="transition-colors hover:text-brand-light">
                      {resolveText(l.label, locale)}
                    </SmoothLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          {config.showNewsletter && (
            <div>
              <h4 className="font-display font-bold text-white">{newsletterTitle}</h4>
              <p className="mt-4 text-sm">{newsletterText}</p>
              <form className="mt-4 flex gap-2">
                <div className="relative flex-1">
                  <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" width={16} height={16} />
                  <input
                    type="email"
                    required
                    placeholder={t("emailPlaceholder")}
                    className="w-full rounded-full border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-white/30 focus:border-brand focus:outline-none"
                  />
                </div>
                <button type="submit" className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105">
                  {t("subscribe")}
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm text-white/50 sm:flex-row">
          <p>© {new Date().getFullYear()} MiRutaFit. {copyright}</p>
          {madeWith ? (
            <p>{madeWith}</p>
          ) : (
            <p className="flex items-center gap-1.5">
              {t("madeWith")} <HeartIcon className="text-brand" width={14} height={14} /> {t("madeIn")}
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
