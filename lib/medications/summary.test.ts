import { getMedicationSummary } from "./summary";

describe("getMedicationSummary", () => {
  it("returns the summary for the active locale", () => {
    const summary = { en: "English summary", fr: "Résumé français" };

    expect(getMedicationSummary({ summary }, "fr")).toBe("Résumé français");
  });

  it("falls back to the default locale when the active locale is untranslated", () => {
    const summary = { en: "English summary" };

    expect(getMedicationSummary({ summary }, "fr")).toBe("English summary");
  });

  it("returns undefined when the medication has no summary", () => {
    expect(getMedicationSummary({}, "fr")).toBeUndefined();
  });
});
