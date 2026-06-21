import { sponsors } from "@/lib/data";
import { ArrowRightIcon } from "./icons";

export default function Sponsors() {
  // Duplicamos la lista para que la marquesina sea continua
  const loop = [...sponsors, ...sponsors];

  return (
    <section id="sponsors" className="border-y border-ink/5 bg-gray-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand">
              Confían en el proyecto
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
              Marcas que acompañan el camino
            </h2>
            <p className="mt-2 text-ink/60">
              Trabajo con marcas que comparten los mismos valores: salud real,
              constancia y resultados honestos.
            </p>
          </div>
          <a
            href="#contacto"
            className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-105"
          >
            Quiero ser sponsor
            <ArrowRightIcon className="transition-transform group-hover:translate-x-1" width={16} height={16} />
          </a>
        </div>
      </div>

      {/* Marquesina */}
      <div className="marquee-pause relative mt-12 overflow-hidden">
        {/* Desvanecidos a los lados */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-gray-50 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-gray-50 to-transparent" />

        <div className="flex w-max animate-marquee gap-4">
          {loop.map((sponsor, i) => (
            <div
              key={`${sponsor.name}-${i}`}
              className="flex min-w-[200px] items-center gap-3 rounded-2xl border border-ink/5 bg-white px-6 py-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand/10 font-display text-lg font-extrabold text-brand">
                {sponsor.name.charAt(0)}
              </span>
              <div>
                <p className="font-display font-bold leading-tight text-ink">{sponsor.name}</p>
                <p className="text-xs text-ink/50">{sponsor.tagline}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
