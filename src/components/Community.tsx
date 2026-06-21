"use client";

import { useState, type FormEvent } from "react";
import { comments as seedComments, type Comment } from "@/lib/data";
import { QuoteIcon } from "./icons";

const avatarColors = ["bg-emerald-500", "bg-teal-500", "bg-lime-500", "bg-green-600"];

export default function Community() {
  const [list, setList] = useState<Comment[]>(seedComments);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    // De momento es optimista (solo en el navegador). Cuando exista la API
    // de comentarios haremos el POST y revalidaremos.
    const nuevo: Comment = {
      id: crypto.randomUUID(),
      name: name.trim(),
      message: message.trim(),
      avatarColor: avatarColors[Math.floor(Math.random() * avatarColors.length)],
      date: "Ahora mismo",
      source: "comunidad",
    };
    setList((prev) => [nuevo, ...prev]);
    setName("");
    setMessage("");
    setSent(true);
    setTimeout(() => setSent(false), 3500);
  };

  return (
    <section id="comunidad" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand">
            La comunidad
          </p>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-ink sm:text-4xl">
            Lo que dice la gente que ya empezó
          </h2>
          <p className="mt-3 text-ink/60">
            Déjame tu mensaje. Leo todos y me motivan a seguir compartiendo.
          </p>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_360px]">
          {/* Muro de comentarios */}
          <div className="grid gap-5 sm:grid-cols-2">
            {list.map((c) => (
              <div
                key={c.id}
                className="relative flex flex-col rounded-3xl border border-ink/5 bg-gray-50 p-6 shadow-sm"
              >
                <QuoteIcon className="text-brand/30" width={28} height={28} />
                <p className="mt-3 flex-1 leading-relaxed text-ink/80">{c.message}</p>
                <div className="mt-5 flex items-center gap-3">
                  <span
                    className={`grid h-10 w-10 place-items-center rounded-full ${c.avatarColor} font-display font-bold text-white`}
                  >
                    {c.name.charAt(0)}
                  </span>
                  <div>
                    <p className="font-semibold text-ink">{c.name}</p>
                    <p className="text-xs text-ink/50">{c.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Formulario de comentario */}
          <div className="h-fit rounded-3xl bg-ink p-7 text-white lg:sticky lg:top-28">
            <h3 className="font-display text-xl font-bold">Deja tu comentario</h3>
            <p className="mt-1 text-sm text-white/60">
              Cuéntanos cómo vas o qué te gustaría ver.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="c-name" className="mb-1.5 block text-sm text-white/70">
                  Tu nombre
                </label>
                <input
                  id="c-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="¿Cómo te llamas?"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40"
                />
              </div>
              <div>
                <label htmlFor="c-msg" className="mb-1.5 block text-sm text-white/70">
                  Tu mensaje
                </label>
                <textarea
                  id="c-msg"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  placeholder="Escribe aquí..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-full bg-brand py-3 font-semibold text-white shadow-lg shadow-brand/30 transition-transform hover:scale-[1.02]"
              >
                Publicar comentario
              </button>
              {sent && (
                <p className="text-center text-sm text-brand-light">
                  ¡Gracias! Tu comentario ya aparece arriba 🎉
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
