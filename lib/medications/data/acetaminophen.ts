import type { Medication } from "../type";

export const medication = {
  slug: "acetaminophen",
  name: "Acetaminophen",
  summary: {
    en: `
Acetaminophen, also known as paracetamol, is one of the most widely used medicines for relieving pain and reducing fever. It is available in many countries under different brand names and is sold both as a prescription medicine and as an over-the-counter (OTC) product. Because it is inexpensive, readily available, and generally well tolerated when taken correctly, acetaminophen is commonly used by adults and children. It is often found in household medicine cabinets and is included as an ingredient in many combination products used to treat colds, flu, headaches, and other common illnesses.
`,
  },
} satisfies Medication;
