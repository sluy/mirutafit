"use client";

import { createContext, useContext } from "react";
import {
  getText,
  setText,
  getList,
  setList,
  type LocalizedText,
  type LocalizedList,
} from "./i18n";

type WidgetLocaleCtx = {
  locales: string[]; // enabled locales (the tabs)
  defaultLocale: string; // base language for legacy plain values
  editLocale: string; // the locale currently being edited
};

const WidgetLocaleContext = createContext<WidgetLocaleCtx>({
  locales: ["en"],
  defaultLocale: "en",
  editLocale: "en",
});

export function WidgetLocaleProvider({
  value,
  children,
}: {
  value: WidgetLocaleCtx;
  children: React.ReactNode;
}) {
  return <WidgetLocaleContext.Provider value={value}>{children}</WidgetLocaleContext.Provider>;
}

export function useWidgetLocale() {
  return useContext(WidgetLocaleContext);
}

/** Bound get/set helpers for the locale currently being edited. */
export function useLocalized() {
  const { editLocale, defaultLocale } = useWidgetLocale();
  return {
    locale: editLocale,
    /** text value for the active edit-locale */
    g: (v: LocalizedText | undefined) => getText(v, editLocale, defaultLocale),
    /** produce the updated localized text */
    s: (v: LocalizedText | undefined, next: string): LocalizedText =>
      setText(v, editLocale, next, defaultLocale),
    /** list value for the active edit-locale */
    gl: (v: LocalizedList | undefined) => getList(v, editLocale, defaultLocale),
    sl: (v: LocalizedList | undefined, next: string[]): LocalizedList =>
      setList(v, editLocale, next, defaultLocale),
  };
}

/** Language tabs shown above a widget editor (only with >1 enabled locale). */
export function LocaleTabs({
  locales,
  editLocale,
  defaultLocale,
  localeNames,
  onSelect,
}: {
  locales: string[];
  editLocale: string;
  defaultLocale: string;
  localeNames: Record<string, string>;
  onSelect: (locale: string) => void;
}) {
  if (locales.length <= 1) return null;
  return (
    <div className="mb-5 flex gap-1 border-b border-ink/10">
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => onSelect(l)}
          className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            editLocale === l ? "border-brand text-brand" : "border-transparent text-ink/50 hover:text-ink"
          }`}
        >
          {localeNames[l] ?? l.toUpperCase()}
          {l === defaultLocale && <span className="ml-1 text-[10px] text-ink/30">(base)</span>}
        </button>
      ))}
    </div>
  );
}
