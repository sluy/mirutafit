import { readFile, writeFile } from "fs/promises";
import nodePath from "path";
import { prisma } from "./prisma";
import { locales, defaultLocale, type Locale } from "@/i18n/config";

/**
 * Runtime translation overrides.
 *
 * The base copy lives in `src/messages/<locale>.json`. Admins can override any
 * string from `/admin/system/languages`; overrides are stored in the DB (one
 * `system_setting` row per locale, as a flat `{ "a.b.c": "value" }` map) and
 * merged over the base when messages are built for a request.
 */

export type FlatMessages = Record<string, string>;

const settingKey = (locale: string) => `translations:${locale}`;

/** Flatten a nested messages object to dot-path leaf strings. */
export function flatten(obj: unknown, prefix = ""): FlatMessages {
  const out: FlatMessages = {};
  if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      const path = prefix ? `${prefix}.${k}` : k;
      if (v && typeof v === "object" && !Array.isArray(v)) {
        Object.assign(out, flatten(v, path));
      } else {
        out[path] = String(v);
      }
    }
  }
  return out;
}

function deepSet(target: Record<string, unknown>, path: string, value: string) {
  const parts = path.split(".");
  let cur = target;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (typeof cur[p] !== "object" || cur[p] === null) cur[p] = {};
    cur = cur[p] as Record<string, unknown>;
  }
  cur[parts[parts.length - 1]] = value;
}

async function loadBase(locale: Locale): Promise<Record<string, unknown>> {
  return (await import(`../messages/${locale}.json`)).default;
}

export async function getOverrides(locale: string): Promise<FlatMessages> {
  const row = await prisma.systemSetting.findUnique({
    where: { key: settingKey(locale) },
  });
  return (row?.value as FlatMessages | undefined) ?? {};
}

export async function saveOverrides(
  locale: string,
  overrides: FlatMessages,
): Promise<void> {
  await prisma.systemSetting.upsert({
    where: { key: settingKey(locale) },
    create: { key: settingKey(locale), value: overrides },
    update: { value: overrides },
  });
}

/** Base messages with DB overrides applied — used by the i18n request config. */
export async function buildMessages(locale: Locale): Promise<Record<string, unknown>> {
  const base = await loadBase(locale);
  const overrides = await getOverrides(locale);
  const result = structuredClone(base);
  for (const [path, value] of Object.entries(overrides)) deepSet(result, path, value);
  return result;
}

/** Everything the admin language editor needs. */
export type EditorData = {
  locales: string[];
  defaultLocale: string;
  data: Record<string, { base: FlatMessages; overrides: FlatMessages }>;
};

export async function getEditorData(): Promise<EditorData> {
  const data: EditorData["data"] = {};
  for (const locale of locales) {
    data[locale] = {
      base: flatten(await loadBase(locale)),
      overrides: await getOverrides(locale),
    };
  }
  return {
    locales: [...locales],
    defaultLocale,
    data,
  };
}

/** Persist only the values that differ from the base copy. */
export async function applyEditorValues(values: Record<string, FlatMessages>) {
  for (const locale of locales) {
    const submitted = values[locale] ?? {};
    const base = flatten(await loadBase(locale));
    const overrides: FlatMessages = {};
    for (const [key, value] of Object.entries(submitted)) {
      if (value !== (base[key] ?? "")) overrides[key] = value;
    }
    await saveOverrides(locale, overrides);
  }
}

/**
 * Add a new key to the base English JSON file on disk.
 * Also writes empty values for all other locale files so they stay in sync.
 */
export async function addBaseKey(key: string, enValue: string): Promise<void> {
  const messagesDir = nodePath.join(process.cwd(), "src", "messages");

  for (const locale of locales) {
    const filePath = nodePath.join(messagesDir, `${locale}.json`);
    const raw = await readFile(filePath, "utf8");
    const tree = JSON.parse(raw) as Record<string, unknown>;
    const value = locale === defaultLocale ? enValue : "";
    deepSet(tree, key, value);
    await writeFile(filePath, JSON.stringify(tree, null, 2) + "\n", "utf8");
  }
}
