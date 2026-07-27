"use client";

import { useState, type CSSProperties } from "react";
import { useTranslations, useLocale } from "next-intl";
import { HeartIcon, CheckIcon, ExternalLinkIcon } from "@/components/icons";
import { resolveText } from "../i18n";
import type { DonationsConfig } from "../types";

/** Frontend render for the Donations / "support me" widget. */
export default function DonationsWidget({ config }: { config: DonationsConfig }) {
  const t = useTranslations("widgets.donations");
  const locale = useLocale();
  const [copied, setCopied] = useState<string | null>(null);
  const eyebrow = resolveText(config.eyebrow, locale);
  const heading = resolveText(config.heading, locale);
  const text = resolveText(config.text, locale);

  const bg = config.bg || "#0a1410";
  const sectionStyle: CSSProperties = { backgroundColor: bg };

  const copy = async (id: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(id);
      setTimeout(() => setCopied((c) => (c === id ? null : c)), 2000);
    } catch {
      // Clipboard may be unavailable (insecure context) — ignore silently.
    }
  };

  let sectionClasses = "relative overflow-hidden py-20 text-white sm:py-28";
  if (config.fullHeight) {
    sectionClasses += " min-h-[100dvh] flex flex-col justify-center";
  }

  return (
    <section style={sectionStyle} className={sectionClasses}>
      {/* Background glows */}
      <div className="absolute -right-24 top-0 h-80 w-80 rounded-full bg-brand/20 blur-3xl" />
      <div className="absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-lime/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            {eyebrow && (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-brand-light">
                <HeartIcon width={14} height={14} />
                {eyebrow}
              </span>
            )}
            <h2 className="mt-5 font-display text-3xl font-extrabold leading-tight sm:text-4xl">{heading}</h2>
            {text && <p className="mt-5 text-lg leading-relaxed text-white/70">{text}</p>}
          </div>

          {/* Payment methods */}
          <div className="grid gap-4">
            {config.methods.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition-colors hover:bg-white/10"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <span
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-xl font-display text-lg font-extrabold text-white"
                    style={{ backgroundColor: m.color || "#10b981" }}
                  >
                    {m.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-display font-bold">{m.name}</p>
                    <p className="truncate text-sm text-white/60">{m.detail}</p>
                  </div>
                </div>

                {m.link ? (
                  <a
                    href={m.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-brand hover:text-brand-light"
                  >
                    {t("donate")}
                    <ExternalLinkIcon width={14} height={14} />
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => copy(m.id, m.detail)}
                    className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-brand hover:text-brand-light"
                  >
                    {copied === m.id ? (
                      <>
                        <CheckIcon width={14} height={14} />
                        {t("copied")}
                      </>
                    ) : (
                      t("copy")
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
