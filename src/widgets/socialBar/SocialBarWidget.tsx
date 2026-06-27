import type { CSSProperties } from "react";
import { getSocialLinks } from "@/lib/settings";
import { SocialIconLinks } from "@/components/SocialIconLinks";
import type { SocialBarConfig } from "../types";

/** Frontend render for the Social bar widget. Server component (loads links). */
export default async function SocialBarWidget({ config }: { config: SocialBarConfig }) {
  const social = await getSocialLinks();
  if (social.length === 0) return null;

  const alignClass =
    config.align === "left"
      ? "justify-start"
      : config.align === "center"
        ? "justify-center"
        : "justify-end";

  return (
    // Positioning (fixed vs flow) is handled by the page renderer's pinned
    // stack, so the bar itself is always a normal block.
    <div style={{ backgroundColor: config.bg, color: config.text }}>
      <div
        className={`social-hover mx-auto flex max-w-7xl items-center gap-4 px-4 py-2.5 sm:px-6 ${alignClass}`}
        style={{ "--social-hover": config.hover } as CSSProperties}
      >
        <SocialIconLinks links={social} size={17} />
      </div>
    </div>
  );
}
