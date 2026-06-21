import { posts } from "@/lib/data";
import { ArrowRightIcon, ClockIcon } from "./icons";

export default function Posts() {
  return (
    <section id="blog" className="bg-gray-50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-end justify-between gap-4 sm:flex-row">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand">
              Del blog
            </p>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-ink sm:text-4xl">
              Lo último que estoy compartiendo
            </h2>
          </div>
          <a
            href="#blog"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-dark"
          >
            Ver todos los artículos
            <ArrowRightIcon className="transition-transform group-hover:translate-x-1" width={16} height={16} />
          </a>
        </div>

        <div className="mt-12 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="group flex flex-col overflow-hidden rounded-3xl border border-ink/5 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              {/* Portada */}
              <div className={`relative aspect-[16/10] bg-gradient-to-br ${post.cover}`}>
                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-ink">
                  {post.category}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center gap-3 text-xs text-ink/50">
                  <span>{post.date}</span>
                  <span className="flex items-center gap-1">
                    <ClockIcon width={13} height={13} />
                    {post.readingTime}
                  </span>
                </div>

                <h3 className="mt-3 font-display text-xl font-bold leading-snug text-ink transition-colors group-hover:text-brand">
                  {post.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ink/60">
                  {post.excerpt}
                </p>

                <a
                  href={`#${post.slug}`}
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand"
                >
                  Leer artículo
                  <ArrowRightIcon width={15} height={15} />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
