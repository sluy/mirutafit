import type { ReactNode } from "react";

/**
 * Lightweight CSS tooltip. Wraps a trigger and shows a label on hover/focus.
 *
 *   <Tooltip label="Rotate left"><button>…</button></Tooltip>
 */
export function Tooltip({
  label,
  children,
  side = "top",
}: {
  label: string;
  children: ReactNode;
  side?: "top" | "bottom";
}) {
  const pos =
    side === "top"
      ? "bottom-full mb-2"
      : "top-full mt-2";
  return (
    <span className="group/tt relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 ${pos} whitespace-nowrap rounded-md bg-ink px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/tt:opacity-100`}
      >
        {label}
      </span>
    </span>
  );
}
