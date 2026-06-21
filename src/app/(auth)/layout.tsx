import Link from "next/link";
import { HeartIcon } from "@/components/icons";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2 font-display text-2xl font-extrabold text-ink">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white">
          <HeartIcon width={18} height={18} />
        </span>
        Mi<span className="text-brand">Ruta</span>Fit
      </Link>
      <div className="w-full max-w-md rounded-3xl border border-ink/5 bg-white p-8 shadow-xl sm:p-10">
        {children}
      </div>
    </div>
  );
}
