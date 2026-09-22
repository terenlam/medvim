import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import poCodecFactory from "@eloqnt/format-po";

import { routing } from "@/i18n/routing";

/** The same PO codec that the `next-intl` catalog loader uses. */
const codec = poCodecFactory();

const MESSAGES_DIR = import.meta.dirname;
const SOURCE_LOCALE = "en";

interface CatalogEntry {
  /** Auto-generated key, stored in `msgctxt`. */
  id: string;
  /**
   * `msgid` for the source locale, `msgstr` for target locales (an empty
   * `msgstr` resolves to the empty string — there is no fallback).
   */
  value: string;
  description: string[];
}

function readCatalog(locale: string): CatalogEntry[] {
  const content = readFileSync(resolve(MESSAGES_DIR, `${locale}.po`), "utf8");

  return codec.decode(content, { locale, sourceLocale: SOURCE_LOCALE }).map((entry) => ({
    id: entry.id,
    value: entry.message,
    description: entry.description,
  }));
}

function readCatalogIds(locale: string): string[] {
  return readCatalog(locale)
    .map(({ id }) => id)
    .sort();
}

const source = readCatalog(SOURCE_LOCALE);
const targetLocales = routing.locales.filter((locale) => locale !== SOURCE_LOCALE);

describe("message catalogs", () => {
  it("has a catalog file for every configured locale", () => {
    const catalogs = readdirSync(MESSAGES_DIR)
      .filter((file) => file.endsWith(".po"))
      .map((file) => file.replace(/\.po$/, ""))
      .sort();

    expect(catalogs).toEqual([...routing.locales].sort());
  });

  it("has a non-empty source catalog with unique keys", () => {
    expect(source.length).toBeGreaterThan(0);
    expect(new Set(source.map(({ id }) => id)).size).toBe(source.length);
  });

  it.each(targetLocales)("defines the same message keys in %s", (locale) => {
    expect(readCatalogIds(locale)).toEqual(readCatalogIds(SOURCE_LOCALE));
  });

  it.each(targetLocales)("has no empty translations in %s", (locale) => {
    // An untranslated entry renders as an empty string at runtime, so it has
    // to fail here rather than silently shipping a gap.
    const empty = readCatalog(locale)
      .filter(({ value }) => value.trim() === "")
      .map(({ id }) => id);

    expect(empty).toEqual([]);
  });
});
