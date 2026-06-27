"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { ChevronDownIcon } from "@/components/icons";
import type { GoTopConfig } from "../types";

/** Floating "scroll to top" button. Renders fixed; appears after scrolling. */
export default function GoTopWidget({ config }: { config: GoTopConfig }) {
  const t = useTranslations("widgets.goTop");
  const [visible, setVisible] = useState(false);
  const showAfter = config.showAfter ?? 300;

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > showAfter);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [showAfter]);

  const offset = config.offset ?? 24;
  const corner = config.corner ?? "bottom-right";
  const pos: CSSProperties = { position: "fixed", zIndex: 40 };
  if (corner.includes("bottom")) pos.bottom = offset; else pos.top = offset;
  if (corner.includes("right")) pos.right = offset; else pos.left = offset;

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <button
      type="button"
      onClick={scrollTop}
      aria-label={t("label")}
      style={{
        ...pos,
        backgroundColor: config.bg || "#16c47f",
        color: config.iconColor || "#ffffff",
        borderRadius: config.round ? "9999px" : "0.9rem",
      }}
      className={`grid h-12 w-12 place-items-center shadow-xl shadow-ink/20 transition-all duration-300 hover:scale-110 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <ChevronDownIcon width={22} height={22} className="rotate-180" />
    </button>
  );
}
