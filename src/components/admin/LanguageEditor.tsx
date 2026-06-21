"use client";

import {
  useCallback,
  useDeferredValue,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  saveTranslationsAction,
  addKeyAction,
} from "@/app/admin/system/languages/actions";
import type { EditorData } from "@/lib/translations";

type Flat = Record<string, string>;

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const ROW_HEIGHT = 52; // px per row
const PAGE_SIZE = 60; // rows rendered at a time (virtual window)

/* ------------------------------------------------------------------ */
/*  Main component                                                    */
/* ------------------------------------------------------------------ */

export default function LanguageEditor({
  editorData,
  localeNames,
}: {
  editorData: EditorData;
  localeNames: Record<string, string>;
}) {
  const t = useTranslations("admin.languages");
  const router = useRouter();

  const { locales, defaultLocale, data } = editorData;
  const [activeTab, setActiveTab] = useState(defaultLocale);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [saving, setSaving] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [addingKey, setAddingKey] = useState(false);

  const isBase = activeTab === defaultLocale;

  // Build merged values: base + overrides for each locale
  const initial = useMemo(() => {
    const result: Record<string, Flat> = {};
    for (const locale of locales) {
      const { base, overrides } = data[locale];
      const merged: Flat = {};
      // All keys come from the default locale
      const allKeys = Object.keys(data[defaultLocale].base);
      for (const k of allKeys) {
        merged[k] = overrides[k] ?? base[k] ?? "";
      }
      result[locale] = merged;
    }
    return result;
  }, [locales, data, defaultLocale]);

  // Live editing ref — doesn't re-render on every keystroke
  const values = useRef<Record<string, Flat>>(
    JSON.parse(JSON.stringify(initial)),
  );

  // All keys from English base, sorted
  const allKeys = useMemo(
    () => Object.keys(data[defaultLocale].base).sort(),
    [data, defaultLocale],
  );

  // Filtered keys based on search
  const filteredKeys = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    if (!q) return allKeys;
    return allKeys.filter((k) => {
      if (k.toLowerCase().includes(q)) return true;
      // Search in all locale values
      for (const locale of locales) {
        const val = initial[locale][k];
        if (val?.toLowerCase().includes(q)) return true;
      }
      return false;
    });
  }, [deferredSearch, allKeys, locales, initial]);

  // Virtualized window state
  const scrollRef = useRef<HTMLDivElement>(null);
  const [visibleStart, setVisibleStart] = useState(0);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const start = Math.floor(el.scrollTop / ROW_HEIGHT);
    setVisibleStart(start);
  }, []);

  const totalHeight = filteredKeys.length * ROW_HEIGHT;
  const overscan = 10;
  const windowStart = Math.max(0, visibleStart - overscan);
  const windowEnd = Math.min(
    filteredKeys.length,
    visibleStart + PAGE_SIZE + overscan,
  );
  const visibleKeys = filteredKeys.slice(windowStart, windowEnd);

  // Save handler
  const save = async () => {
    setSaving(true);
    try {
      const { ok } = await saveTranslationsAction(values.current);
      if (ok) {
        toast.success(t("saved"));
        router.refresh();
      } else {
        toast.error(t("error"));
      }
    } catch {
      toast.error(t("error"));
    } finally {
      setSaving(false);
    }
  };

  // Add key handler
  const handleAddKey = async () => {
    if (!newKey.trim() || !newValue.trim()) return;
    const trimmedKey = newKey.trim();

    // Check if key already exists
    if (allKeys.includes(trimmedKey)) {
      toast.error(t("keyExists"));
      return;
    }

    setAddingKey(true);
    try {
      const { ok, error } = await addKeyAction(trimmedKey, newValue);
      if (ok) {
        toast.success(t("keyAdded"));
        setNewKey("");
        setNewValue("");
        setAddOpen(false);
        router.refresh();
      } else {
        toast.error(error ?? t("error"));
      }
    } catch {
      toast.error(t("error"));
    } finally {
      setAddingKey(false);
    }
  };

  // Count missing translations for a locale
  const missingCount = useMemo(() => {
    if (activeTab === defaultLocale) return 0;
    const localeData = initial[activeTab] ?? {};
    return allKeys.filter((k) => !localeData[k]).length;
  }, [activeTab, defaultLocale, initial, allKeys]);

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-ink/5 bg-white shadow-sm">
      {/* ── Language Tabs ── */}
      <div className="flex items-center gap-1 border-b border-ink/5 bg-gray-50/80 px-4 pt-3">
        {locales.map((locale) => {
          const active = locale === activeTab;
          const isMissing =
            locale !== defaultLocale &&
            allKeys.some((k) => !initial[locale]?.[k]);
          return (
            <button
              key={locale}
              type="button"
              onClick={() => setActiveTab(locale)}
              className={`relative rounded-t-lg px-5 py-2.5 text-sm font-semibold transition-colors ${
                active
                  ? "bg-white text-brand shadow-sm"
                  : "text-ink/50 hover:text-ink/80"
              }`}
            >
              <span className="uppercase">{locale}</span>
              <span className="ml-1.5 text-xs font-normal normal-case text-ink/40">
                {localeNames[locale] ?? locale}
              </span>
              {isMissing && !active && (
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-amber-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Toolbar ── */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b border-ink/5 bg-white px-4 py-3">
        {/* Search */}
        <div className="relative min-w-0 flex-1">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx={11} cy={11} r={8} />
            <path d="m21 21-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("search")}
            className="w-full rounded-xl border border-ink/10 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-ink transition-colors focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </div>

        {/* Add key (only on English tab) */}
        {isBase && (
          <button
            type="button"
            onClick={() => setAddOpen(!addOpen)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
              addOpen
                ? "border-brand bg-brand/5 text-brand"
                : "border-ink/10 text-ink/60 hover:border-brand hover:text-brand"
            }`}
          >
            <svg width={14} height={14} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M7 1v12M1 7h12" />
            </svg>
            {t("addKey")}
          </button>
        )}

        {/* Stats badge */}
        <span className="text-xs text-ink/40">
          {t("showing", {
            count: filteredKeys.length,
            total: allKeys.length,
          })}
        </span>

        {/* Save */}
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
        >
          {saving ? "…" : t("save")}
        </button>
      </div>

      {/* ── Add Key Form (expandable) ── */}
      {addOpen && isBase && (
        <div className="border-b border-ink/5 bg-brand/[0.02] px-4 py-3">
          <div className="flex items-end gap-3">
            <label className="min-w-0 flex-1">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-ink/40">
                {t("keyLabel")}
              </span>
              <input
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder={t("addKeyPlaceholder")}
                className="w-full rounded-lg border border-ink/10 bg-white px-3 py-2 font-mono text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </label>
            <label className="min-w-0 flex-[2]">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-ink/40">
                {t("valueLabel")}
              </span>
              <input
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder={t("addValuePlaceholder")}
                className="w-full rounded-lg border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </label>
            <button
              type="button"
              onClick={handleAddKey}
              disabled={addingKey || !newKey.trim() || !newValue.trim()}
              className="shrink-0 rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
            >
              {addingKey ? "…" : t("add")}
            </button>
          </div>
        </div>
      )}

      {/* ── Missing count banner ── */}
      {!isBase && missingCount > 0 && (
        <div className="flex items-center gap-2 border-b border-amber-200/50 bg-amber-50/50 px-4 py-2 text-xs text-amber-700">
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M12 9v4M12 17h.01" />
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          </svg>
          {t("missingCount", { count: missingCount })}
        </div>
      )}

      {/* ── Column Headers ── */}
      <div
        className="grid border-b border-ink/5 bg-gray-50/60 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-ink/40"
        style={{
          gridTemplateColumns: isBase
            ? "minmax(200px,1fr) minmax(200px,2fr) 80px"
            : "minmax(160px,1fr) minmax(160px,1.5fr) minmax(160px,1.5fr) 80px",
        }}
      >
        <span>{t("colKey")}</span>
        {!isBase && (
          <span className="uppercase">{defaultLocale}</span>
        )}
        <span className="uppercase">
          {isBase ? t("colValue") : activeTab}
        </span>
        <span className="text-right">{t("colStatus")}</span>
      </div>

      {/* ── Virtualized Row List ── */}
      {filteredKeys.length === 0 ? (
        <div className="flex items-center justify-center py-20 text-sm text-ink/40">
          {t("noResults")}
        </div>
      ) : (
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 340px)" }}
        >
          <div style={{ height: totalHeight, position: "relative" }}>
            <div
              style={{
                position: "absolute",
                top: windowStart * ROW_HEIGHT,
                left: 0,
                right: 0,
              }}
            >
              {visibleKeys.map((key) => (
                <TranslationRow
                  key={`${activeTab}-${key}`}
                  k={key}
                  locale={activeTab}
                  isBase={isBase}
                  defaultLocale={defaultLocale}
                  initialValue={initial[activeTab]?.[key] ?? ""}
                  enValue={initial[defaultLocale]?.[key] ?? ""}
                  baseValue={data[activeTab]?.base[key] ?? ""}
                  onChange={(value) => {
                    values.current[activeTab] = values.current[activeTab] ?? {};
                    values.current[activeTab][key] = value;
                  }}
                  height={ROW_HEIGHT}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Individual row                                                    */
/* ------------------------------------------------------------------ */

function TranslationRow({
  k,
  locale,
  isBase,
  defaultLocale,
  initialValue,
  enValue,
  baseValue,
  onChange,
  height,
}: {
  k: string;
  locale: string;
  isBase: boolean;
  defaultLocale: string;
  initialValue: string;
  enValue: string;
  baseValue: string;
  onChange: (value: string) => void;
  height: number;
}) {
  const t = useTranslations("admin.languages");
  const [value, setValue] = useState(initialValue);
  const modified = value !== baseValue;
  const missing = !isBase && !value;

  const inputCls =
    "w-full bg-transparent px-3 py-1.5 text-sm text-ink transition-colors rounded-lg border border-transparent hover:border-ink/10 focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20";

  return (
    <div
      className="grid items-center border-b border-ink/[0.03] px-4 transition-colors hover:bg-gray-50/60"
      style={{
        height,
        gridTemplateColumns: isBase
          ? "minmax(200px,1fr) minmax(200px,2fr) 80px"
          : "minmax(160px,1fr) minmax(160px,1.5fr) minmax(160px,1.5fr) 80px",
      }}
    >
      {/* Key */}
      <span className="truncate pr-3 font-mono text-xs text-ink/50" title={k}>
        {k}
      </span>

      {/* English reference (only for non-base) */}
      {!isBase && (
        <span className="truncate pr-3 text-sm text-ink/30" title={enValue}>
          {enValue}
        </span>
      )}

      {/* Editable value */}
      <input
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          onChange(e.target.value);
        }}
        placeholder={!isBase ? enValue : undefined}
        className={inputCls}
      />

      {/* Status */}
      <div className="flex justify-end">
        {modified ? (
          <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-semibold text-brand">
            {t("modified")}
          </span>
        ) : missing ? (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-600">
            {t("missing")}
          </span>
        ) : (
          <span className="rounded-full bg-ink/5 px-2 py-0.5 text-[10px] font-medium text-ink/30">
            {t("base")}
          </span>
        )}
      </div>
    </div>
  );
}
