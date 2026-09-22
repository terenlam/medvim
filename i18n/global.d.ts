import { routing } from "./routing";

declare module "next-intl" {
  interface AppConfig {
    /** Narrows locale strings to the locales defined in `i18n/routing.ts`. */
    // https://next-intl.dev/docs/workflows/typescript
    Locale: (typeof routing.locales)[number];
    // `Messages` is intentionally not declared: with `useExtracted`, message
    // keys are generated content hashes and ICU arguments are type-checked
    // against the inline message instead.
    // https://next-intl.dev/docs/usage/plugin#createmessagesdeclaration
  }
}
