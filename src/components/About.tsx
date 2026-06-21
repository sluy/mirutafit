import { CheckIcon } from "./icons";

const pillars = [
  "Nada de dietas milagro: hábitos que se sostienen en el tiempo.",
  "Entrenamientos para hacer en casa o en el gym, a tu ritmo.",
  "Comida real, rica y adaptada a lo que se consigue aquí.",
];

export default function About() {
  return (
    <section id="sobre-mi" className="bg-white py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
        {/* Imagen / collage */}
        <div className="relative">
          <div className="aspect-square w-full rounded-[2rem] bg-gradient-to-br from-brand to-brand-dark shadow-2xl" />
          <div className="absolute -bottom-6 -right-4 hidden rounded-2xl bg-ink px-6 py-5 text-white shadow-xl sm:block">
            <p className="font-display text-lg font-bold">3 años</p>
            <p className="text-sm text-white/60">compartiendo el proceso</p>
          </div>
          <div className="absolute -left-4 top-8 hidden rounded-2xl bg-lime px-5 py-3 font-display font-bold text-ink shadow-xl sm:block">
            #MiRutaFit
          </div>
        </div>

        {/* Texto */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-brand">
            Sobre mí
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight text-ink sm:text-4xl">
            No soy entrenador de revista. Soy alguien que lo logró.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-ink/70">
            Hace unos años pesaba mucho más y mi salud no estaba bien. Empecé sin
            saber nada, con prueba y error, y poco a poco fui encontrando una forma
            de vivir que sí podía mantener. Hoy comparto todo lo que aprendí para
            que tu inicio sea más fácil que el mío.
          </p>

          <ul className="mt-8 space-y-4">
            {pillars.map((p) => (
              <li key={p} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand/15 text-brand">
                  <CheckIcon width={14} height={14} />
                </span>
                <span className="text-ink/80">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
