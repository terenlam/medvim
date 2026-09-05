import type { Medication } from "./type";

const medicationModules = import.meta.glob("./data/*.ts", {
  eager: true,
  import: "medication",
}) as Record<string, Medication>;

const slugCollator = new Intl.Collator("en", { sensitivity: "base" });

export const medications: readonly Medication[] = Object.freeze(
  Object.values(medicationModules).sort((a, b) => slugCollator.compare(a.slug, b.slug)),
);