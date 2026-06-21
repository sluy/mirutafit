"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Lightweight top progress bar shown while navigating between pages.
 * Dependency-free: it starts when an internal link is clicked and finishes
 * once the pathname actually changes. `loading.tsx` files cover the data-
 * fetching phase; this gives instant click feedback.
 */
export default function TopLoader() {
  const pathname = usePathname();
  const [width, setWidth] = useState(0);
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const first = useRef(true);

  const start = () => {
    if (timer.current) clearInterval(timer.current);
    setVisible(true);
    setWidth(8);
    timer.current = setInterval(() => {
      setWidth((w) => (w < 90 ? w + (90 - w) * 0.12 : w));
    }, 220);
  };

  const finish = () => {
    if (timer.current) clearInterval(timer.current);
    setWidth(100);
    window.setTimeout(() => setVisible(false), 250);
    window.setTimeout(() => setWidth(0), 550);
  };

  // Navigation completed → finish the bar.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Start the bar when an internal link is clicked.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
        return;
      const anchor = (e.target as HTMLElement)?.closest?.("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      const target = anchor.getAttribute("target");
      if (
        !href ||
        target === "_blank" ||
        href.startsWith("http") ||
        href.startsWith("#") ||
        href.startsWith("mailto") ||
        href.startsWith("tel")
      )
        return;
      if (href === pathname) return;
      start();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [pathname]);

  if (!visible && width === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-0.5">
      <div
        className="h-full bg-brand shadow-[0_0_12px_2px] shadow-brand/60 transition-[width,opacity] duration-200 ease-out"
        style={{ width: `${width}%`, opacity: visible ? 1 : 0 }}
      />
    </div>
  );
}
