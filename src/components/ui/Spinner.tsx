/** Brand spinner. */
export function Spinner({ size = 24 }: { size?: number }) {
  return (
    <span
      role="status"
      aria-label="loading"
      className="inline-block animate-spin rounded-full border-2 border-brand/25 border-t-brand"
      style={{ width: size, height: size }}
    />
  );
}

/** Centered full-height loader used by route-level `loading.tsx` files. */
export function FullPageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <Spinner size={40} />
        <span className="font-display text-sm font-semibold tracking-wide text-ink/40">
          Mi<span className="text-brand">Ruta</span>Fit
        </span>
      </div>
    </div>
  );
}
