/** @vitest-environment happy-dom — jsdom does not implement `isContentEditable`. */
import { isEditableTarget } from "./editable-target";

describe("isEditableTarget", () => {
  it("is true for an input", () => {
    expect(isEditableTarget(document.createElement("input"))).toBe(true);
  });

  it("is true for a textarea", () => {
    expect(isEditableTarget(document.createElement("textarea"))).toBe(true);
  });

  it("is true for a contenteditable element", () => {
    const element = document.createElement("div");
    element.setAttribute("contenteditable", "true");

    expect(isEditableTarget(element)).toBe(true);
  });

  it("is true for a descendant of a contenteditable element", () => {
    const root = document.createElement("div");
    root.setAttribute("contenteditable", "true");
    const child = document.createElement("span");
    root.appendChild(child);

    expect(isEditableTarget(child)).toBe(true);
  });

  it("is false for a plain element", () => {
    expect(isEditableTarget(document.createElement("div"))).toBe(false);
  });

  it("is false for a button", () => {
    expect(isEditableTarget(document.createElement("button"))).toBe(false);
  });

  it("is false for null", () => {
    expect(isEditableTarget(null)).toBe(false);
  });
});
