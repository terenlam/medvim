import { medications } from "./medications";

describe("medications catalog", () => {
  it("is not empty", () => {
    expect(medications.length).toBeGreaterThan(0);
  });

  it("has unique slugs", () => {
    const slugs = medications.map(({ slug }) => slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
