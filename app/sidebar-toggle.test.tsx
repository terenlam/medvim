/** @vitest-environment happy-dom */
import { pushMock, renderWithMedications } from "./command-box.test-utils";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useIsMobile } from "@/hooks/use-mobile";

const it = test
  .extend("resetMockState", { auto: true }, () => {
    pushMock.mockClear();
    vi.mocked(useIsMobile).mockReset();
  })
  .extend("scrollBy", async ({}, { onCleanup }) => {
    const scrollBy = vi.fn();
    Object.defineProperty(window, "scrollBy", {
      configurable: true,
      writable: true,
      value: scrollBy,
    });
    onCleanup(() => {
      Reflect.deleteProperty(window, "scrollBy");
    });
    return scrollBy;
  })
  .extend("scrollTo", async ({}, { onCleanup }) => {
    const scrollTo = vi.fn();
    Object.defineProperty(window, "scrollTo", {
      configurable: true,
      writable: true,
      value: scrollTo,
    });
    onCleanup(() => {
      Reflect.deleteProperty(window, "scrollTo");
    });
    return scrollTo;
  });

async function toggleSidebar(user: ReturnType<typeof userEvent.setup>) {
  await user.keyboard("{Control>}b{/Control}");
}

describe("sidebar toggle (Ctrl+B)", () => {
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

  it("scrolls the main content with 'j' and 'k' when the sidebar is closed", async ({
    scrollBy,
  }) => {
    const user = await renderWithMedications("boots");

    await toggleSidebar(user);
    await user.keyboard("j");
    expect(scrollBy).toHaveBeenCalledWith(0, 32);

    await user.keyboard("k");
    expect(scrollBy).toHaveBeenCalledWith(0, -32);
  });

  it("does not scroll the main content with 'j' and 'k' when the sidebar is open", async ({
    scrollBy,
  }) => {
    const user = await renderWithMedications("boots");

    await user.keyboard("j");
    await user.keyboard("k");

    expect(scrollBy).not.toHaveBeenCalled();
  });

  it("scrolls the main content to the top with 'gg' when the sidebar is closed", async ({
    scrollTo,
  }) => {
    const user = await renderWithMedications("boots");

    await toggleSidebar(user);
    await user.keyboard("gg");

    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it("scrolls the main content to the bottom with 'G' when the sidebar is closed", async ({
    scrollTo,
  }) => {
    const user = await renderWithMedications("boots");

    await toggleSidebar(user);
    await user.keyboard("G");

    expect(scrollTo).toHaveBeenCalledWith(0, document.documentElement.scrollHeight);
  });

  it("does not scroll the main content with 'gg' and 'G' when the sidebar is open", async ({
    scrollTo,
  }) => {
    const user = await renderWithMedications("boots");

    await user.keyboard("gg");
    await user.keyboard("G");

    expect(scrollTo).not.toHaveBeenCalled();
  });
});

