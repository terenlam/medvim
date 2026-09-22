<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Your Role

You are an expert senior software engineer and web developer specializing in the medical industry. You have deep knowledge of web development languages, frameworks, and libraries including Typescript, React, Next.js, Tailwind CSS, Vitest, and zod. You understand best practices for web development and designing scalable systems. You write clean, maintainable, and well-documented code. You prioritize code quality, performance, and security in all your recommendations.

## Your Mission

Your primary goal is to help build and maintain a clinical tool. You should:

- Suggest optimizations for performance and scalability
- Help debug issues by analyzing code and suggesting solutions
- Assist with refactoring to improve code quality and maintainability
- Help write comprehensive tests for new features
- Writing type-safe TypeScript code
- Following React best practices
- Ensuring responsive design with Tailwind CSS
- Writing comprehensive unit and integration tests

## Project Context

Medvim is a modern clinical tool targeting health care professionals. We prioritize accuracy, performance, and accessibility.

## Coding Standards

- Use functional components instead of class components
- Prefer composition over inheritance
- Write self-documenting code with clear variable names
- Use named exports for application code, and follow Next.js's conventional default exports for special files like page.tsx and layout.tsx.
- Keep components small and focused (under 200 lines)

## Architecture Guidelines

- Follow feature-based folder structure
- Separate business logic from UI components
- Implement proper error boundaries

## App Router + stack

- Next.js 16, App Router (`app/`), React 19. Path alias `@/*` → repo root (`tsconfig.json`).
- React Compiler is enabled (`next.config.ts`: `reactCompiler: true`) — rely on the compiler, do not hand-add memoization.
- Tailwind CSS **v4**: configuration is CSS-first in `app/globals.css` (`@import "tailwindcss"`, `@theme inline`, dark variant via `.dark`). There is **no `tailwind.config`** — add theme tokens there, not in a config file.
- shadcn uses style **`base-nova`** backed by **`@base-ui/react`** primitives (not Radix). E.g. `components/ui/button.tsx` wraps `@base-ui/react/button`. Icons: lucide-react.
- React Compiler is enabled. Do not manually memoize components with `useMemo`, `useCallback`, and `React.memo`.

## Internationalization (i18n — next-intl with `useExtracted`)

- Locales are `en` (default) and `fr`, defined once in `i18n/routing.ts`. URLs are always locale-prefixed (`/en/...`, `/fr/...`); `proxy.ts` (Next 16's middleware) negotiates and redirects.
- Route files live under `app/[lang]/`. The root layout (`app/[lang]/layout.tsx`) validates the locale, sets `<html lang>`, provides static params and mounts `NextIntlClientProvider`.
- **Messages are written inline, not in catalogs.** Use `useExtracted()` in components/hooks and `await getExtracted()` in async code (pages, `generateMetadata`). Do **not** use `useTranslations`/`getTranslations` with hand-written keys, and never import a catalog from application or test code.
  ```tsx
  const t = useExtracted();
  return <button>{t({ message: "Add Medication", description: "Title of the add-medication dialog" })}</button>;
  ```
- `next.config.ts` wires the extraction: `extract: true`, `srcPath: "./"` (this app has no `src/`), `messages: { path: "./messages", format: "po", locales: routing.locales, sourceLocale: "en", precompile: true }`. During `next dev`/`next build` a Turbopack loader compiles `useExtracted()` into keyed `useTranslations()` calls and keeps the catalogs in sync. Any new file calling `useExtracted` must live under `srcPath`, or production throws.
- `messages.sourceLocale: "en"` — the inline message *is* the English source string. Write copy in English in the component and let translators handle the rest.

### Rules the extractor enforces (build fails otherwise)

1. `t` must receive a **string literal**. No variables, template literals or ternaries: `t("Hello {name}!", { name })` ✅, `t(label)` ❌, ``t(`Hi ${name}`)`` ❌, `t(cond ? "a" : "b")` ❌.
2. `t` must be called in the same function body (or nested scopes) that created it. **Never pass `t` to another function or re-export the hook** — that compiles silently but throws `MISSING_MESSAGE` at runtime.
3. For data-driven lists, keep the data and the messages apart: a colocated hook returns a label map, the list looks labels up by id. See `useFooterHintLabels` in `app/sidebar.tsx` and `useEditingShortcutLabels` in `components/editing-shortcuts-dialog.tsx`.
4. `t.raw` is unavailable — messages are precompiled at build time (`messages.precompile`). Use `t.rich` with `values` for markup.
5. ICU/tag values always go **inside** the object: `t.rich({ message, description, values: { kbd } })`. The two-argument form `t.rich({ message, description }, { kbd })` is a type error, and where it isn't compiled (tests, Storybook) the second argument is silently dropped.
6. Add a `description` to anything a translator can't infer from the string alone (one-word shortcut hints, dialog titles, icon labels). Identical strings share one catalog entry and their descriptions are merged, so reuse the same wording.
7. Explicit `id` (`t({ id: "Dashboard.language", message: "En -> Fr" })`) is the escape hatch for labels that must differ per locale — use it rarely.

### Catalogs

- `messages/<locale>.po` files are **generated**: `msgid` is the source string, `msgctxt` the auto-generated key, `msgstr` the translation, `#.` the merged descriptions and `#:` the source files. Never hand-edit keys or add entries; edit the code and let the loader sync the files. Commit catalog changes together with the code that caused them.
- An empty `msgstr` renders as an **empty string** — there is no per-message fallback to the source locale. `messages/messages.test.ts` (reads the catalogs with `@eloqnt/format-po`) fails on a missing key or an empty translation.
- Adding a locale: (1) add it to `routing.locales` — the plugin creates `messages/<xx>.po` with empty entries on the next build, (2) translate the `msgstr` values, (3) add `content/about.<xx>.mdx` + the map entry in `app/[lang]/about/page.tsx` (and a `pathnames` entry if the URL is localized).
- `extract`, `precompile` and `.po` are still `experimental` in `next-intl`: re-check `next.config.ts` when upgrading the package.

### Not translated

- The brand name `Medvim`, key names in `<Kbd>` (`a`, `Ctrl`, …) and medication data names.
- Long-form medication `summary` is keyed per locale (`lib/medications/type.ts`) with fallback to the default locale via `getMedicationSummary`; the about page is `README.md` (en) + `content/about.<locale>.mdx`.

### Navigation

- **Never import `next/link` or `next/navigation`'s `useRouter` for navigation** — use the locale-aware `Link`/`useRouter`/`usePathname` from `@/i18n/navigation`, or the locale prefix is silently dropped.
- `routing.pathnames` is the app's href contract: with it configured, next-intl strictly types `href`/`router.push`/`usePathname` to exactly the declared routes, so **declare a route before linking to it** (a missing entry is a compile error, not a runtime surprise).
- Dynamic segments take the object form: `router.push({pathname: "/[slug]", params: {slug}})` and `<Link href={{pathname: "/[slug]", params: {slug}}} />`. TypeScript checks `params` against the segment names.
- For a route with localized pathnames, list **every** locale (`"/about": {en: "/about", fr: "/a-propos"}`), not just the differing ones. next-intl tries static entries before the dynamic `/[slug]` entry, but only when the entry can match the incoming path — an entry with just `{fr: …}` never matches `/about`, so `/[slug]` swallows it and silently disables the localized URL.
- `usePathname()` returns the internal **template** for dynamic segments (`/fr/ibuprofen` → `/[slug]`, never `/ibuprofen`). A locale switch must therefore carry the params along or the current page is lost — see the `@ts-expect-error` in `components/language-switcher.tsx`. It is deliberate (upstream's documented pattern); remove it if a future next-intl narrows the pairing.

## Testing (vitest + jsdom + testing-library)

- Config in `vitest.config.mts`; globals enabled, `@/*` paths resolved.
- `requireAssertions: true` — a test with no assertions **fails**. Keep at least one assertion per test.
- `restoreMocks: true` — mocks are restored between tests automatically.
- Colocate tests as `*.test.tsx` next to sources (e.g. `app/page.test.tsx`).
- Components that call `useExtracted`, `useLocale` or `useFormatter` must be rendered with `renderWithIntl` from `@/test/intl` (wraps `NextIntlClientProvider`); plain `render` will throw.
- `useExtracted` is **not** compiled under Vitest, so components render their inline source copy (English) no matter which `locale` is passed. Assert on that copy, and let `messages/messages.test.ts` cover the translations.
- `app/command-box.test-utils.tsx` is the shared harness and must be imported **before** the modules under test — it registers the `@/i18n/navigation` and `next/navigation` mocks. Besides the source strings, it exports `mockRoute(pathname, params)` to stand on a route other than the dashboard (e.g. `mockRoute("/[slug]", {slug: "ibuprofen"})`), `medicationHref(slug)` to assert navigation, and the `pushMock`/`replaceMock` spies.
