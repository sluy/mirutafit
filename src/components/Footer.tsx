import { HeartIcon, MailIcon } from "./icons";
import { SocialIconLinks } from "./SocialIconLinks";
import type { FooterConfig } from "@/widgets/types";
import type { SocialLink } from "@/lib/settings";

const columns = [
  {
    title: "Navega",
    links: [
      { label: "Inicio", href: "#inicio" },
      { label: "Sobre mí", href: "#sobre-mi" },
      { label: "Blog", href: "#blog" },
      { label: "Comunidad", href: "#comunidad" },
    ],
  },
  {
    title: "Recursos",
    links: [
      { label: "Sponsors", href: "#sponsors" },
      { label: "Apóyame", href: "#apoyo" },
      { label: "Contacto", href: "#contacto" },
      { label: "Iniciar sesión", href: "/login" },
    ],
  },
];

export default function Footer({
  config,
  social,
}: {
  config: FooterConfig;
  social: SocialLink[];
}) {
  return (
    <footer className="bg-ink text-white/70">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className={`grid gap-10 ${config.showNewsletter ? "lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]" : "lg:grid-cols-[1.5fr_1fr_1fr]"}`}>
          {/* Marca */}
          <div>
            <a href="#inicio" className="flex items-center gap-2 font-display text-2xl font-extrabold text-white">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand">
                <HeartIcon width={18} height={18} />
              </span>
              <span>Mi<span className="text-brand">Ruta</span>Fit</span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed">
              {config.tagline}
            </p>
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

          {/* Columnas de links */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-display font-bold text-white">{col.title}</h4>
              <ul className="mt-4 space-y-3 text-sm">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="transition-colors hover:text-brand-light">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          {config.showNewsletter && (
            <div>
              <h4 className="font-display font-bold text-white">Recibe novedades</h4>
              <p className="mt-4 text-sm">
                Rutinas, recetas y motivación directo a tu correo. Sin spam.
              </p>
              <form className="mt-4 flex gap-2">
                <div className="relative flex-1">
                  <MailIcon
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
                    width={16}
                    height={16}
                  />
                  <input
                    type="email"
                    required
                    placeholder="Tu correo"
                    className="w-full rounded-full border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-white/30 focus:border-brand focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105"
                >
                  Unirme
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm text-white/50 sm:flex-row">
          <p>© {new Date().getFullYear()} MiRutaFit. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1.5">
            Hecho con <HeartIcon className="text-brand" width={14} height={14} /> en Venezuela
          </p>
        </div>
      </div>
    </footer>
  );
}
