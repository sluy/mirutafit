// Datos de prueba (mock). Cuando conectemos Postgres + Prisma, esto se
// reemplaza por consultas reales sin tocar los componentes.

export type Sponsor = {
  name: string;
  tagline: string;
};

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readingTime: string;
  date: string;
  cover: string; // gradiente tailwind para el placeholder
};

export type Comment = {
  id: string;
  name: string;
  avatarColor: string;
  message: string;
  date: string;
  source: "comunidad" | "destacado";
};

export const sponsors: Sponsor[] = [
  { name: "NutriVida", tagline: "Suplementos" },
  { name: "FitGear", tagline: "Equipamiento" },
  { name: "PowerBlend", tagline: "Nutrición" },
  { name: "RutaSana", tagline: "Alimentos" },
  { name: "MoveLab", tagline: "Apps fitness" },
  { name: "Hidratta", tagline: "Bebidas" },
];

export const posts: Post[] = [
  {
    slug: "primeros-10-kilos",
    title: "Cómo perdí mis primeros 10 kilos sin pasar hambre",
    excerpt:
      "El cambio no empezó en el gimnasio, empezó en la cocina y en la cabeza. Te cuento el plan que sí me funcionó.",
    category: "Mi historia",
    readingTime: "6 min",
    date: "12 jun 2026",
    cover: "from-emerald-400 to-lime-300",
  },
  {
    slug: "rutina-casa-sin-equipo",
    title: "Rutina de 20 minutos en casa (sin equipo)",
    excerpt:
      "No necesitas máquinas para empezar. Esta es la rutina que hago cuando no puedo salir y que cualquiera puede seguir.",
    category: "Entrenamiento",
    readingTime: "4 min",
    date: "5 jun 2026",
    cover: "from-teal-500 to-emerald-400",
  },
  {
    slug: "comer-rico-y-sano-venezuela",
    title: "Comer rico y sano en Venezuela con poco presupuesto",
    excerpt:
      "Ideas reales de comidas balanceadas con ingredientes que sí consigues y que no rompen el bolsillo.",
    category: "Nutrición",
    readingTime: "8 min",
    date: "28 may 2026",
    cover: "from-green-500 to-emerald-300",
  },
];

export const comments: Comment[] = [
  {
    id: "c1",
    name: "Andrea G.",
    avatarColor: "bg-emerald-500",
    message:
      "Empecé a seguir tus rutinas hace dos meses y ya bajé 4 kilos. Lo mejor es que no se siente como un castigo. ¡Gracias por la motivación!",
    date: "Hace 2 días",
    source: "destacado",
  },
  {
    id: "c2",
    name: "Luis M.",
    avatarColor: "bg-teal-500",
    message:
      "Tu historia me hizo dar el primer paso. Verte contar los tropiezos también ayuda un montón, se siente real.",
    date: "Hace 5 días",
    source: "destacado",
  },
  {
    id: "c3",
    name: "Carolina R.",
    avatarColor: "bg-lime-500",
    message:
      "Las recetas con presupuesto venezolano son oro puro. Por fin algo aplicable a mi día a día.",
    date: "Hace 1 semana",
    source: "destacado",
  },
];

export const stats = [
  { value: "-32 kg", label: "en mi propio camino" },
  { value: "+18k", label: "en la comunidad" },
  { value: "120+", label: "artículos y videos" },
  { value: "3 años", label: "compartiendo el proceso" },
];

export const donationMethods = [
  { name: "Pago Móvil", detail: "Banesco · 0414-0000000", color: "bg-emerald-500" },
  { name: "Binance Pay", detail: "ID: 123456789", color: "bg-amber-400" },
  { name: "PayPal", detail: "paypal.me/mirutafit", color: "bg-sky-500" },
];
