"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { Medication } from "@/lib/medications/type";

interface AddedMedicationsContextValue {
  added: readonly Medication[];
  addMedication: (medication: Medication) => void;
  removeMedication: (slug: string) => void;
  isAdded: (slug: string) => boolean;
}

const AddedMedicationsContext = createContext<AddedMedicationsContextValue | null>(null);

export function AddedMedicationsProvider({ children }: { children: React.ReactNode }) {
  const [added, setAdded] = useState<Medication[]>([]);

  const value = useMemo<AddedMedicationsContextValue>(
    () => ({
      added,
      addMedication: (medication) => {
        setAdded((current) =>
          current.some((item) => item.slug === medication.slug)
            ? current
            : [...current, medication],
        );
      },
      removeMedication: (slug) => {
        setAdded((current) => current.filter((medication) => medication.slug !== slug));
      },
      isAdded: (slug) => added.some((medication) => medication.slug === slug),
    }),
    [added],
  );

  return (
    <AddedMedicationsContext.Provider value={value}>{children}</AddedMedicationsContext.Provider>
  );
}

export function useAddedMedications() {
  const context = useContext(AddedMedicationsContext);
  if (!context) {
    throw new Error("useAddedMedications must be used within an AddedMedicationsProvider.");
  }
  return context;
}