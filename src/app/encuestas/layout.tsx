import Link from "next/link";
import { HeartIcon } from "@/components/icons";

/** Minimal, focused chrome for public surveys (works even in maintenance mode). */
export default function SurveysLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-ink/5 bg-white">
        <div className="mx-auto flex max-w-3xl items-center px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-display text-xl font-extrabold text-ink">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-white">
              <HeartIcon width={16} height={16} />
            </span>
            <span>Mi<span className="text-brand">Ruta</span>Fit</span>
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">{children}</main>
    </div>
  );
}
