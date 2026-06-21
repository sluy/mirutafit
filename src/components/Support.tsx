import { donationMethods } from "@/lib/data";
import { HeartIcon } from "./icons";

export default function Support() {
  return (
    <section id="apoyo" className="relative overflow-hidden bg-ink py-20 text-white sm:py-28">
      {/* Glow de fondo */}
      <div className="absolute -right-24 top-0 h-80 w-80 rounded-full bg-brand/20 blur-3xl" />
      <div className="absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-lime/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-brand-light">
              <HeartIcon width={14} height={14} />
              Apoya el proyecto
            </span>
            <h2 className="mt-5 font-display text-3xl font-extrabold leading-tight sm:text-4xl">
              Si algo de lo que comparto te ha ayudado, puedes invitarme un café
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-white/70">
              Todo este contenido es gratuito. Tu aporte —del tamaño que sea— me
              ayuda a seguir creando rutinas, recetas y artículos para la
              comunidad. ¡Gracias de corazón! 💚
            </p>
          </div>

          {/* Métodos de pago */}
          <div className="grid gap-4">
            {donationMethods.map((m) => (
              <div
                key={m.name}
                className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition-colors hover:bg-white/10"
              >
                <div className="flex items-center gap-4">
                  <span className={`grid h-12 w-12 place-items-center rounded-xl ${m.color} font-display text-lg font-extrabold text-white`}>
                    {m.name.charAt(0)}
                  </span>
                  <div>
                    <p className="font-display font-bold">{m.name}</p>
                    <p className="text-sm text-white/60">{m.detail}</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="shrink-0 rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-brand hover:text-brand-light"
                >
                  Copiar
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
