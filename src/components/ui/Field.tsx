import type { ReactNode } from "react";

/** Shared input class. Pass `true` to render the error (red) state. */
export function inputClass(hasError?: boolean) {
  return `w-full rounded-xl border bg-gray-50 px-4 py-3 text-sm text-ink placeholder:text-ink/30 transition-colors focus:bg-white focus:outline-none focus:ring-2 ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-300/40"
      : "border-ink/10 focus:border-brand focus:ring-brand/30"
  }`;
}

/**
 * Labelled form field with an optional error message. A non-empty `error`
 * shows red helper text; pass a single space to mark the field red without
 * a message (e.g. to highlight related fields).
 */
export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-ink/70">
        {label}
      </label>
      {children}
      {error && error.trim() ? (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-ink/40">{hint}</p>
      ) : null}
    </div>
  );
}
