import { medications } from "./medications";
import { getMedication } from "./getMedication";

const { medicationsMock } = vi.hoisted(() => ({
  medicationsMock: [
    { slug: "alpha", name: "Alpha" },
    { slug: "bravo", name: "Bravo" },
  ],
}));

vi.mock("./medications", () => ({ medications: medicationsMock }));

describe("getMedication", () => {
  it("returns the medication for an existing slug", () => {
    expect(getMedication(medicationsMock[0].slug)).toEqual(medicationsMock[0]);
  });

  it("matches on slug, not display name", () => {
    expect(getMedication(medicationsMock[0].name)).toBeUndefined();
    expect(getMedication(medicationsMock[0].slug)).toBeDefined();
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

