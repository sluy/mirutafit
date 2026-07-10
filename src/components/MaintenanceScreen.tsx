import { HeartIcon } from "@/components/icons";

/** Full-page maintenance notice shown to non-admin visitors when enabled. */
export default function MaintenanceScreen({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink px-6 text-center text-white">
      <div className="mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-brand">
        <HeartIcon width={30} height={30} />
      </div>
      <div className="mb-2 font-display text-2xl font-extrabold">
        Mi<span className="text-brand">Ruta</span>Fit
      </div>
      <h1 className="mt-4 max-w-xl font-display text-3xl font-extrabold leading-tight sm:text-4xl">{title}</h1>
      <p className="mt-4 max-w-lg whitespace-pre-wrap leading-relaxed text-white/70">{message}</p>
    </div>
  );
}
