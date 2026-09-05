import type { Medication } from "./type";
import { medications } from "./medications";

export type { Medication } from "./type";
export { medications } from "./medications";

export function getMedication(slug: string): Medication | undefined {
  return medications.find((medication) => medication.slug === slug);
}

