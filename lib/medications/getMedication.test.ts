import { medications } from "./medications";
import { getMedication } from ".";

describe("getMedication", () => {
  it("returns the medication for an existing slug", () => {
    expect(getMedication("acetaminophen")).toEqual({
      slug: "acetaminophen",
      name: "Acetaminophen",
    });
  });

  it("matches on slug, not display name", () => {
    expect(getMedication("Acetaminophen")).toBeUndefined();
    expect(getMedication("acetaminophen")).toBeDefined();
  });

  it("returns undefined for an unknown slug", () => {
    expect(getMedication("does-not-exist")).toBeUndefined();
  });

  it("returns undefined for an empty string", () => {
    expect(getMedication("")).toBeUndefined();
  });

  it("returns undefined for whitespace-only input", () => {
    expect(getMedication("   ")).toBeUndefined();
  });

  it("round-trips every medication in the catalog by its slug", () => {
    for (const medication of medications) {
      expect(getMedication(medication.slug)).toBe(medication);
    }
  });
});
