import type { Locale } from "@/i18n/routing";

export interface Medication {
  slug: string;
  name: string;
  /** Long-form content keyed by locale; falls back to the default locale. */
  summary?: Partial<Record<Locale, string>>;
}
