"use client";

import { useState, type FormEvent } from "react";
import { CheckIcon, MailIcon, PhoneIcon, ArrowRightIcon } from "./icons";

type Mode = "persona" | "marca";

const topics: Record<Mode, string[]> = {
  persona: [
    "Quiero empezar y no sé cómo",
    "Dudas sobre entrenamiento",
    "Dudas sobre alimentación",
    "Solo quiero saludar",
    "Otro",
  ],
  marca: [
    "Propuesta de colaboración",
    "Patrocinio / sponsorship",
    "Publicidad y contenido",
    "Embajador de marca",
    "Otro (negocios)",
  ],
};

const banner: Record<Mode, { title: string; text: string; points: string[] }> = {
  persona: {
    title: "¿Listo para empezar tu ruta?",
    text: "Escríbeme y te respondo personalmente. No importa en qué punto estés, siempre hay un primer paso.",
    points: [
      "Respuesta directa y cercana",
      "Sin compromiso ni venta agresiva",
      "Te oriento según tu objetivo",
    ],
  },
  marca: {
    title: "Hagamos algo grande juntos",
    text: "Si tu marca comparte los valores de salud real y constancia, conversemos. Cuéntame tu propuesta.",
    points: [
      "Audiencia comprometida y real",
      "Contenido auténtico, no forzado",
      "Reportes y métricas de campaña",
    ],
  },
};

export default function Contact() {
  const [mode, setMode] = useState<Mode>("persona");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Aún sin backend: simulamos el envío. Luego hará POST a /api/contacto.
    setSent(true);
    (e.target as HTMLFormElement).reset();
    setTimeout(() => setSent(false), 4000);
  };

  const b = banner[mode];

  return (
    <section id="contacto" className="bg-gray-50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand">
            Hablemos
          </p>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-ink sm:text-4xl">
            Contáctame
          </h2>
          <p className="mt-3 text-ink/60">
            ¿Eres una persona que quiere empezar o una marca que quiere colaborar?
            Elige una opción.
          </p>
        </div>

        {/* Selector de modo */}
        <div className="mx-auto mt-8 flex max-w-md rounded-full bg-ink/5 p-1.5">
          {(["persona", "marca"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-all ${
                mode === m
                  ? "bg-brand text-white shadow-lg shadow-brand/25"
                  : "text-ink/60 hover:text-ink"
              }`}
            >
              {m === "persona" ? "Soy una persona" : "Soy una marca"}
            </button>
          ))}
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-stretch">
          {/* Banner lateral dinámico */}
          <div
            className={`relative flex flex-col justify-between overflow-hidden rounded-3xl p-8 text-white transition-colors duration-500 ${
              mode === "persona"
                ? "bg-gradient-to-br from-brand to-brand-dark"
                : "bg-gradient-to-br from-ink to-ink-soft"
            }`}
          >
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
            <div className="relative">
              <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                {mode === "persona" ? "Para ti 💪" : "Para marcas 🤝"}
              </span>
              <h3 className="mt-5 font-display text-2xl font-bold leading-tight">
                {b.title}
              </h3>
              <p className="mt-3 leading-relaxed text-white/80">{b.text}</p>

              <ul className="mt-7 space-y-3">
                {b.points.map((p) => (
                  <li key={p} className="flex items-center gap-3 text-sm">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/20">
                      <CheckIcon width={12} height={12} />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative mt-8 space-y-2 border-t border-white/15 pt-6 text-sm text-white/80">
              <a href="mailto:hola@mirutafit.com" className="flex items-center gap-2">
                <MailIcon width={16} height={16} /> hola@mirutafit.com
              </a>
              <a href="tel:+580000000000" className="flex items-center gap-2">
                <PhoneIcon width={16} height={16} /> +58 000 000 0000
              </a>
            </div>
          </div>

          {/* Formulario */}
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-ink/5 bg-white p-8 shadow-sm"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Nombre" htmlFor="name">
                <input
                  id="name"
                  name="name"
                  required
                  placeholder={mode === "persona" ? "Tu nombre" : "Nombre / Empresa"}
                  className={inputCls}
                />
              </Field>
              <Field label="Correo" htmlFor="email">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="correo@ejemplo.com"
                  className={inputCls}
                />
              </Field>
              <Field label="Teléfono" htmlFor="phone">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+58 ..."
                  className={inputCls}
                />
              </Field>
              <Field label="Tema" htmlFor="topic">
                <select id="topic" name="topic" required className={inputCls}>
                  <option value="">Selecciona un tema</option>
                  {topics[mode].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="mt-5">
              <Field label="Título" htmlFor="title">
                <input
                  id="title"
                  name="title"
                  required
                  placeholder="Asunto de tu mensaje"
                  className={inputCls}
                />
              </Field>
            </div>

            <div className="mt-5">
              <Field label="Descripción" htmlFor="description">
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={5}
                  placeholder={
                    mode === "persona"
                      ? "Cuéntame en qué punto estás y en qué te puedo ayudar..."
                      : "Cuéntame sobre tu marca y la propuesta de colaboración..."
                  }
                  className={`${inputCls} resize-none`}
                />
              </Field>
            </div>

            <button
              type="submit"
              className="group mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand py-3.5 font-semibold text-white shadow-lg shadow-brand/30 transition-transform hover:scale-[1.01] sm:w-auto sm:px-10"
            >
              Enviar mensaje
              <ArrowRightIcon className="transition-transform group-hover:translate-x-1" width={18} height={18} />
            </button>

            {sent && (
              <p className="mt-4 flex items-center gap-2 text-sm font-medium text-brand">
                <CheckIcon width={16} height={16} />
                ¡Mensaje enviado! Te responderé pronto.
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}

const inputCls =
  "w-full rounded-xl border border-ink/10 bg-gray-50 px-4 py-3 text-sm text-ink placeholder:text-ink/30 focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/30";

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-ink/70">
        {label}
      </label>
      {children}
    </div>
  );
}
