"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

export type SelectOption = {
  value: string;
  label: string;
  icon?: ReactNode;
};

/**
 * A smart select with search filtering, keyboard navigation, portal-based
 * dropdown that escapes overflow-hidden containers, and auto dropup when
 * there isn't enough space below.
 */
export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  disabled = false,
  className = "",
}: {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlighted, setHighlighted] = useState(0);

  const btnRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [pos, setPos] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const selected = options.find((o) => o.value === value);

  const filtered = search.trim()
    ? options.filter(
        (o) =>
          o.label.toLowerCase().includes(search.toLowerCase()) ||
          o.value.toLowerCase().includes(search.toLowerCase()),
      )
    : options;

  const openMenu = useCallback(() => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    // Estimate dropdown height: search bar (~44px) + min(items, 6) * 40px + padding
    const estimatedHeight = 44 + Math.min(options.length, 6) * 40 + 8;
    const goUp = spaceBelow < estimatedHeight && spaceAbove > spaceBelow;

    setPos({
      top: goUp ? rect.top : rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
    setSearch("");
    setHighlighted(0);
    setOpen(true);

    // After render, measure actual dropdown height and reposition if dropup
    requestAnimationFrame(() => {
      const dd = dropdownRef.current;
      if (!dd) return;
      const ddHeight = dd.getBoundingClientRect().height;

      if (goUp) {
        dd.style.top = `${rect.top - ddHeight - 4}px`;
      } else if (rect.bottom + 4 + ddHeight > window.innerHeight - 8) {
        // Overflowing bottom — switch to dropup
        const upTop = rect.top - ddHeight - 4;
        if (upTop >= 0) {
          dd.style.top = `${upTop}px`;
        }
      }
    });
  }, [options.length]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [open]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.children[highlighted] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [highlighted, open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlighted((h) => Math.max(h - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filtered[highlighted]) {
          onChange(filtered[highlighted].value);
          setOpen(false);
        }
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
    }
  };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => (open ? setOpen(false) : openMenu())}
        disabled={disabled}
        className={`flex w-full items-center gap-2 rounded-xl border border-ink/10 bg-gray-50 px-4 py-3 text-left text-sm transition-colors hover:border-ink/20 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:opacity-50 ${className}`}
      >
        {selected?.icon && <span className="shrink-0">{selected.icon}</span>}
        <span className={`flex-1 truncate ${selected ? "text-ink" : "text-ink/30"}`}>
          {selected?.label ?? placeholder}
        </span>
        <svg
          width={12}
          height={12}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          className={`shrink-0 text-ink/30 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open &&
        typeof window !== "undefined" &&
        createPortal(
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-[70]" onClick={() => setOpen(false)} />
            {/* Dropdown */}
            <div
              ref={dropdownRef}
              className="fixed z-[71] overflow-hidden rounded-xl border border-ink/10 bg-white shadow-xl"
              style={{ top: pos.top, left: pos.left, width: Math.max(pos.width, 200) }}
              onKeyDown={handleKeyDown}
            >
              {/* Search input */}
              <div className="border-b border-ink/5 p-2">
                <input
                  ref={searchRef}
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setHighlighted(0);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={searchPlaceholder}
                  className="w-full rounded-lg bg-gray-50 px-3 py-2 text-sm text-ink placeholder:text-ink/30 focus:outline-none"
                />
              </div>
              {/* Options */}
              <div ref={listRef} className="max-h-60 overflow-y-auto py-1">
                {filtered.length === 0 ? (
                  <p className="px-4 py-3 text-center text-sm text-ink/40">
                    No results
                  </p>
                ) : (
                  filtered.map((opt, i) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onChange(opt.value);
                        setOpen(false);
                      }}
                      className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors ${
                        i === highlighted
                          ? "bg-brand/5 text-brand"
                          : opt.value === value
                            ? "bg-brand/5 font-medium text-brand"
                            : "text-ink/70 hover:bg-gray-50"
                      }`}
                    >
                      {opt.icon && <span className="shrink-0 text-base">{opt.icon}</span>}
                      <span className="truncate">{opt.label}</span>
                      {opt.value === value && (
                        <svg
                          width={14}
                          height={14}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={3}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="ml-auto shrink-0 text-brand"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
