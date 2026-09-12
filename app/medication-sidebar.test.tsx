/** @vitest-environment happy-dom */
import { screen } from "@testing-library/react";
import {
  pushMock,
  renderWithMedications,
  searchPlaceholder,
} from "./command-box.test-utils";

describe("medication sidebar", () => {
  it("gives the sidebar keyboard focus after the add command box closes", async () => {
    await renderWithMedications("boots", "corner");

    const boots = screen.getByRole("link", { name: "Boots" });
    expect(boots.getAttribute("aria-current")).toBe("true");
  });

  it("moves the selection down with 'j' and up with 'k'", async () => {
    const user = await renderWithMedications("boots", "corner", "donor");

    await user.keyboard("j");

    const corner = screen.getByRole("link", { name: "Corner" });
    expect(corner.getAttribute("aria-current")).toBe("true");

    await user.keyboard("j");

    const donor = screen.getByRole("link", { name: "Donor" });
    expect(donor.getAttribute("aria-current")).toBe("true");

    await user.keyboard("k");

    expect(corner.getAttribute("aria-current")).toBe("true");
  });

  it("clamps the selection at the first and last medication", async () => {
    const user = await renderWithMedications("boots", "corner");

    await user.keyboard("k");
    expect(screen.getByRole("link", { name: "Boots" }).getAttribute("aria-current")).toBe("true");

    await user.keyboard("k");
    await user.keyboard("j");
    await user.keyboard("j");
    expect(screen.getByRole("link", { name: "Corner" }).getAttribute("aria-current")).toBe("true");
  });

  it("scrolls the selected medication into view with 'j' and 'k'", async () => {
    const scrollIntoView = vi.fn();
    Object.defineProperty(Element.prototype, "scrollIntoView", {
      configurable: true,
      writable: true,
      value: scrollIntoView,
    });

    const user = await renderWithMedications("boots", "corner", "donor");
    scrollIntoView.mockClear();

    await user.keyboard("j");
    expect(scrollIntoView).toHaveBeenCalledWith({ block: "nearest" });

    scrollIntoView.mockClear();
    await user.keyboard("k");
    expect(scrollIntoView).toHaveBeenCalledWith({ block: "nearest" });
  });

  it("navigates to the selected medication page on Enter", async () => {
    const user = await renderWithMedications("boots", "corner");

    await user.keyboard("j");
    await user.keyboard("{Enter}");

    expect(pushMock).toHaveBeenCalledWith("/corner");
  });

  it("navigates to the first medication with Enter when nothing is selected", async () => {
    const user = await renderWithMedications("boots", "corner");

    await user.keyboard("{Enter}");

    expect(pushMock).toHaveBeenCalledWith("/boots");
  });

  it("deletes the selected medication with 'x' and keeps the selection position", async () => {
    const user = await renderWithMedications("boots", "corner", "donor");

    await user.keyboard("j");
    await user.keyboard("x");

    expect(screen.queryByRole("link", { name: "Corner" })).toBeNull();
    expect(screen.getByRole("link", { name: "Donor" }).getAttribute("aria-current")).toBe("true");
  });

  it("deletes the only medication with 'x' and shows the empty state", async () => {
    const user = await renderWithMedications("boots");

    await user.keyboard("x");

    expect(screen.queryByRole("link", { name: "Boots" })).toBeNull();
    expect(screen.getByText(/Press/)).toBeDefined();
  });

  it("reopens the add command box with 'a' from the sidebar", async () => {
    const user = await renderWithMedications("boots");

    await user.keyboard("a");

    expect(screen.getByPlaceholderText("Type a medication name...")).toBeDefined();
  });

  it("opens the search command box with 's' from the sidebar", async () => {
    const user = await renderWithMedications("boots");

    await user.keyboard("s");

    expect(screen.getByPlaceholderText(searchPlaceholder)).toBeDefined();
  });
});