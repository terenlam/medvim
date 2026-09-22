import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import createNextIntlPlugin from "next-intl/plugin";

import { routing } from "./i18n/routing";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  reactCompiler: true,
};

const withMDX = createMDX({
  // Add markdown plugins here, as desired
  extension: /\.(md|mdx)$/,
});

const withNextIntl = createNextIntlPlugin({
  experimental: {
    // Compiles `useExtracted`/`getExtracted` to keyed `useTranslations` calls
    // and keeps `messages/<locale>.po` in sync with the source code.
    extract: true,
    // This app has no `src/` directory, so the repo root is the source path.
    srcPath: "./",
    messages: {
      path: "./messages",
      // PO stores the source string in `msgid`, the key in `msgctxt` and the
      // translation in `msgstr`, plus `#.` descriptions and `#:` references.
      format: "po",
      // `routing.locales` is the single source of truth — adding a locale there
      // makes this plugin create `messages/<locale>.po` with empty entries.
      locales: routing.locales,
      sourceLocale: "en",
      // Compiles ICU messages at build time (smaller bundle, no runtime parser).
      // Not compatible with `t.raw`, which the app doesn't use.
      precompile: true,
    },
  },
});

export default withNextIntl(withMDX(nextConfig));
