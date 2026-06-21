import { ArrowRightIcon, HeartIcon } from "./icons";
import { stats } from "@/lib/data";

export default function Hero() {
  return (
    <section
      id="inicio"
      className="relative flex min-h-screen items-center overflow-hidden bg-ink text-white"
    >
      {/* Fondo: degradado + manchas de color */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-ink via-ink-soft to-ink" />
        <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-brand/30 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-[28rem] w-[28rem] rounded-full bg-lime/20 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative mx-auto grid w-full max-w-7xl gap-12 px-4 pt-36 pb-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pt-32">
        {/* Texto */}
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-brand-light backdrop-blur">
            <span className="h-2 w-2 animate-pulse rounded-full bg-brand-light" />
            Marca personal · Vida fit
          </span>

          <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            Mi ruta hacia una <span className="text-gradient-brand">vida más sana</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
            Soy MiRutaFit. Aquí comparto mi proceso real de pérdida de peso: los
            entrenamientos, la comida, los tropiezos y todo lo que aprendí en el
            camino. Si tú también quieres empezar, este es tu lugar.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#sobre-mi"
              className="group inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 font-semibold text-white shadow-xl shadow-brand/30 transition-transform hover:scale-105"
            >
              Conoce mi historia
              <ArrowRightIcon className="transition-transform group-hover:translate-x-1" width={18} height={18} />
            </a>
            <a
              href="#apoyo"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-3.5 font-semibold text-white backdrop-blur transition-colors hover:bg-white/10"
            >
              <HeartIcon width={18} height={18} />
              Apóyame
            </a>
          </div>
        </div>

        {/* Tarjeta visual */}
        <div className="relative hidden animate-fade-up lg:block">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm rounded-[2rem] bg-gradient-to-br from-brand/80 to-lime/60 p-1 shadow-2xl">
            <div className="flex h-full w-full flex-col justify-end rounded-[1.9rem] bg-gradient-to-t from-ink/80 to-transparent p-6">
              <p className="font-display text-2xl font-bold">Tu mejor versión</p>
              <p className="mt-1 text-sm text-white/70">empieza con un solo paso.</p>
            </div>
          </div>
          {/* Badge flotante */}
          <div className="absolute -left-6 top-10 rounded-2xl bg-white/95 px-5 py-3 text-ink shadow-xl">
            <p className="font-display text-2xl font-extrabold text-brand">-32 kg</p>
            <p className="text-xs text-ink/60">y sumando</p>
          </div>
        </div>
      </div>

      {/* Stats sobre el borde inferior */}
      <div className="absolute inset-x-0 bottom-0">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-t-2xl border border-white/10 bg-white/5 backdrop-blur md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-ink/40 px-5 py-5 text-center">
                <p className="font-display text-2xl font-extrabold text-brand-light sm:text-3xl">
                  {s.value}
                </p>
                <p className="mt-1 text-xs text-white/60">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
