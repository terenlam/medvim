/** @vitest-environment happy-dom */
import { pushMock, renderWithMedications } from "./command-box.test-utils";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useIsMobile } from "@/hooks/use-mobile";

describe("sidebar toggle (Ctrl+B)", () => {
  beforeEach(() => {
    pushMock.mockClear();
    vi.mocked(useIsMobile).mockReset();
  });

  function stubScrollBy() {
    const scrollBy = vi.fn();
    Object.defineProperty(window, "scrollBy", {
      configurable: true,
      writable: true,
      value: scrollBy,
    });
    return scrollBy;
  }

  async function toggleSidebar(user: ReturnType<typeof userEvent.setup>) {
    await user.keyboard("{Control>}b{/Control}");
  }

  it("shows the Ctrl+B toggle hint in the sidebar footer", async () => {
    await renderWithMedications("boots");

    expect(screen.getByText("toggle")).toBeDefined();
  });

  it("closes the sidebar with Ctrl+B and reopens it with Ctrl+B", async () => {
    const user = await renderWithMedications("boots");

    await toggleSidebar(user);

    expect(screen.queryByRole("link", { name: "Boots" })).toBeNull();
    expect(screen.getByTestId("sidebar-wrapper").getAttribute("aria-hidden")).toBe("true");

    await toggleSidebar(user);

    expect(screen.getByRole("link", { name: "Boots" })).toBeDefined();
    expect(screen.getByTestId("sidebar-wrapper").getAttribute("aria-hidden")).toBe("false");
  });

  it("focuses the main content area when the sidebar closes", async () => {
    const user = await renderWithMedications("boots");

    await toggleSidebar(user);

    expect(document.activeElement).toBe(screen.getByTestId("main-content"));
  });

  it("toggles the sidebar with Ctrl+B at narrow screen sizes", async () => {
    vi.mocked(useIsMobile).mockReturnValue(true);
    const user = await renderWithMedications("boots");

    await toggleSidebar(user);

    expect(screen.queryByRole("link", { name: "Boots" })).toBeNull();
    expect(screen.getByTestId("sidebar-wrapper").getAttribute("aria-hidden")).toBe("true");

    await toggleSidebar(user);

    expect(screen.getByRole("link", { name: "Boots" })).toBeDefined();
  });

  it("does nothing on 'x' when the sidebar is closed", async () => {
    const user = await renderWithMedications("boots", "corner");

    await toggleSidebar(user);
    await user.keyboard("x");
    await toggleSidebar(user);

    expect(screen.getByRole("link", { name: "Corner" })).toBeDefined();
  });

  it("does nothing on Enter when the sidebar is closed", async () => {
    const user = await renderWithMedications("boots");

    await toggleSidebar(user);
    await user.keyboard("{Enter}");

    expect(pushMock).not.toHaveBeenCalled();
  });

  it("still opens the add command box with 'a' when the sidebar is closed", async () => {
    const user = await renderWithMedications("boots");

    await toggleSidebar(user);
    await user.keyboard("a");

    expect(screen.getByPlaceholderText("Type a medication name...")).toBeDefined();
  });

  it("scrolls the main content with 'j' and 'k' when the sidebar is closed", async () => {
    const scrollBy = stubScrollBy();
    const user = await renderWithMedications("boots");

    await toggleSidebar(user);
    await user.keyboard("j");
    expect(scrollBy).toHaveBeenCalledWith(0, 32);

    await user.keyboard("k");
    expect(scrollBy).toHaveBeenCalledWith(0, -32);
  });

  it("does not scroll the main content with 'j' and 'k' when the sidebar is open", async () => {
    const scrollBy = stubScrollBy();
    const user = await renderWithMedications("boots");

    await user.keyboard("j");
    await user.keyboard("k");

    expect(scrollBy).not.toHaveBeenCalled();
  });
});