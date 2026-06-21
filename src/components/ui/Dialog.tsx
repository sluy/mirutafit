"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Global reusable Dialog component.
 *
 * Rendered through a portal as a normal stacking overlay (not the native
 * `<dialog>` top layer) so app-wide UI like toasts can sit above it. Closes on
 * Esc or backdrop click; locks body scroll while open.
 *
 * Props:
 *  - `open`     — whether the dialog is visible.
 *  - `onClose`  — callback when the user dismisses it.
 *  - `title`    — optional header text.
 *  - `children` — body content.
 *  - `maxWidth` — Tailwind max-w class, default "max-w-md".
 */
export default function Dialog({
  open,
  onClose,
  title,
  children,
  maxWidth = "max-w-md",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto p-4 sm:items-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        className={`animate-dialog-in relative z-[1] my-auto w-full ${maxWidth} rounded-2xl border border-ink/5 bg-white shadow-2xl`}
      >
        <div className="p-6 sm:p-7">
          {title && (
            <div className="mb-5 flex items-center justify-between gap-4">
              <h3 className="truncate font-display text-lg font-bold text-ink">{title}</h3>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink/40 transition-colors hover:bg-ink/5 hover:text-ink"
              >
                <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                  <path d="M4 4l8 8M12 4l-8 8" />
                </svg>
              </button>
            </div>
          )}
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
