import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";

import type { Medication } from "./type";

/**
 * Resolves the localized summary for a medication, falling back to the
 * default locale when no translation exists for the active locale.
 */
export function getMedicationSummary(
  medication: Pick<Medication, "summary">,
  locale: Locale,
): string | undefined {
  return medication.summary?.[locale] ?? medication.summary?.[routing.defaultLocale];
}
