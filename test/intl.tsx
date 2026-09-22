import type { ReactElement } from "react";
import { render } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";

import { routing, type Locale } from "@/i18n/routing";

export interface RenderWithIntlOptions {
  /** Locale to render with. Defaults to the default locale (`en`). */
  locale?: Locale;
}

/**
 * `render` wrapped in `NextIntlClientProvider` — use this instead of the
 * plain `render` for any component that calls `useExtracted`, `useLocale` or
 * `useFormatter`.
 *
 * No `messages` are passed: `useExtracted` calls are only compiled into
 * catalog lookups by the Next.js build, so under Vitest the inline message is
 * used as-is. Tests therefore assert the source locale (English) copy, and
 * `messages/messages.test.ts` is what guards the translations. The `locale`
 * option still matters for locale-aware APIs such as `useLocale`.
 */
export function renderWithIntl(
  ui: ReactElement,
  { locale = routing.defaultLocale }: RenderWithIntlOptions = {},
) {
  return render(<NextIntlClientProvider locale={locale}>{ui}</NextIntlClientProvider>);
}
