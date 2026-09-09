/** @vitest-environment happy-dom */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppShell } from "./app-shell";
import { medications } from "@/lib/medications/medications";
import { useIsMobile } from "@/hooks/use-mobile";

const { pushMock, medicationsMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  medicationsMock: [
    { slug: "bench", name: "Bench" },
    { slug: "boots", name: "Boots" },
    { slug: "corner", name: "Corner" },
    { slug: "donor", name: "Donor" },
    { slug: "foster", name: "Foster" },
    { slug: "gospel", name: "Gospel" },
  ],
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/lib/medications/medications", () => ({
  medications: medicationsMock,
}));

vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: vi.fn(),
}));

const visibleMedications = medications.slice(0, 5);
const hiddenMedication = medications[5];

const searchPlaceholder = "Type a command or search...";

function openSearch(user: ReturnType<typeof userEvent.setup>) {
  return user.keyboard("s");
}

async function renderWithMedications(...slugs: string[]) {
  const user = userEvent.setup();
  render(<AppShell>content</AppShell>);

  await user.keyboard("a");

  for (const slug of slugs) {
    const medication = medications.find(({ slug: candidate }) => candidate === slug);
    if (medication?.slug === "gospel") {
      const input = screen.getByPlaceholderText("Type a medication name...") as HTMLInputElement;
      await user.type(input, "gospel");
    }
    await user.click(screen.getByText(medication!.name));
  }

  await user.keyboard("{Escape}");
  return user;
}

describe("AppShell command boxes", () => {
  it("has no button to open the menu", () => {
    render(<AppShell>content</AppShell>);
    expect(screen.queryByRole("button", { name: "Open Menu" })).toBeNull();
  });

  it("does not open the search command box until 's' is pressed", () => {
    render(<AppShell>content</AppShell>);
    expect(screen.queryByPlaceholderText(searchPlaceholder)).toBeNull();
  });

  it("opens the search command box when pressing 's' in normal mode", async () => {
    const user = userEvent.setup();
    render(<AppShell>content</AppShell>);

    await user.keyboard("s");

    expect(screen.getByPlaceholderText(searchPlaceholder)).toBeDefined();
  });

  it("does not open when typing 's' into another text field", async () => {
    const user = userEvent.setup();
    render(<AppShell>content</AppShell>);

    const field = document.createElement("input");
    document.body.appendChild(field);

    await user.type(field, "s");

    expect(screen.queryByPlaceholderText(searchPlaceholder)).toBeNull();
    onTestFinished(() => {
      document.body.removeChild(field);
    });
  });

  it("types 's' into the input instead of reopening when open", async () => {
    const user = userEvent.setup();
    render(<AppShell>content</AppShell>);

    await openSearch(user);
    const input = screen.getByPlaceholderText(searchPlaceholder) as HTMLInputElement;
    input.focus();

    await user.keyboard("s");
    expect(screen.getByPlaceholderText(searchPlaceholder)).toBeDefined();
    expect(input.value).toBe("s");
  });

  it("closes the search command box when pressing Escape", async () => {
    const user = userEvent.setup();
    render(<AppShell>content</AppShell>);

    await openSearch(user);
    await user.keyboard("{Escape}");

    expect(screen.queryByPlaceholderText(searchPlaceholder)).toBeNull();
  });
});

describe("search command box", () => {
  it("lists every visible medication with its Alt shortcut", async () => {
    const user = userEvent.setup();
    render(<AppShell>content</AppShell>);

    await openSearch(user);

    visibleMedications.forEach((medication, index) => {
      const option = screen.getByRole("option", {
        name: new RegExp(medication.name),
      });
      expect(option.textContent).toContain(`Alt + ${index + 1}`);
    });
  });

  it("shows only the first 5 medications by default", async () => {
    const user = userEvent.setup();
    render(<AppShell>content</AppShell>);

    await openSearch(user);

    expect(screen.getByText(visibleMedications[4].name)).toBeDefined();
    expect(screen.queryByText(hiddenMedication.name)).toBeNull();
  });

  it("reveals a hidden medication when searching for it", async () => {
    const user = userEvent.setup();
    render(<AppShell>content</AppShell>);

    await openSearch(user);
    await user.type(screen.getByPlaceholderText(searchPlaceholder), "gospel");

    expect(screen.getByText(hiddenMedication.name)).toBeDefined();
    expect(screen.queryByText(visibleMedications[0].name)).toBeNull();
  });

  it("navigates to the medication at the filtered position with Alt+n", async () => {
    const user = userEvent.setup();
    render(<AppShell>content</AppShell>);

    await openSearch(user);
    await user.type(screen.getByPlaceholderText(searchPlaceholder), "o");
    await user.keyboard("{Alt>}5{/Alt}");

    expect(pushMock).toHaveBeenCalledWith("/gospel");
  });

  it("navigates to the medication page when selecting an item", async () => {
    const user = userEvent.setup();
    render(<AppShell>content</AppShell>);

    await openSearch(user);
    await user.click(screen.getByText(visibleMedications[0].name));

    expect(pushMock).toHaveBeenCalledWith(`/${visibleMedications[0].slug}`);
  });

  it("moves to the next medication with Ctrl+J", async () => {
    const user = userEvent.setup();
    render(<AppShell>content</AppShell>);

    await openSearch(user);
    const input = screen.getByPlaceholderText(searchPlaceholder) as HTMLInputElement;
    input.focus();

    await user.keyboard("{Control>}j{/Control}");

    const boots = screen.getByRole("option", { name: /Boots/i });
    expect(boots.getAttribute("aria-selected")).toBe("true");
  });

  it("shows the Ctrl+J and Ctrl+K navigation keybindings", async () => {
    const user = userEvent.setup();
    render(<AppShell>content</AppShell>);

    await openSearch(user);

    expect(screen.getByText("J")).toBeDefined();
    expect(screen.getByText("K")).toBeDefined();
  });
});

describe("add medication command box", () => {
  it("opens the add command box when pressing 'a' in normal mode", async () => {
    const user = userEvent.setup();
    render(<AppShell>content</AppShell>);

    await user.keyboard("a");

    expect(screen.getByPlaceholderText("Type a medication name...")).toBeDefined();
  });

  it("selecting a medication adds it to the sidebar and stays open", async () => {
    const user = userEvent.setup();
    render(<AppShell>content</AppShell>);

    await user.keyboard("a");
    await user.click(screen.getByText(visibleMedications[0].name));

    expect(screen.getByPlaceholderText("Type a medication name...")).toBeDefined();

    await user.keyboard("{Escape}");
    expect(screen.getByRole("link", { name: visibleMedications[0].name })).toBeDefined();
  });

  it("allows adding multiple medications before closing", async () => {
    const user = userEvent.setup();
    render(<AppShell>content</AppShell>);

    await user.keyboard("a");
    await user.click(screen.getByText(visibleMedications[0].name));
    await user.click(screen.getByText(visibleMedications[1].name));

    expect(screen.getByPlaceholderText("Type a medication name...")).toBeDefined();

    await user.keyboard("{Escape}");
    expect(screen.getByRole("link", { name: visibleMedications[0].name })).toBeDefined();
    expect(screen.getByRole("link", { name: visibleMedications[1].name })).toBeDefined();
  });

  it("hides already added medications from the add list", async () => {
    const user = userEvent.setup();
    render(<AppShell>content</AppShell>);

    await user.keyboard("a");
    await user.click(screen.getByText(visibleMedications[0].name));

    expect(screen.queryByRole("option", { name: new RegExp(visibleMedications[0].name) })).toBeNull();
    expect(screen.getByRole("option", { name: new RegExp(visibleMedications[1].name) })).toBeDefined();
  });

  it("clears the search after adding a medication", async () => {
    const user = userEvent.setup();
    render(<AppShell>content</AppShell>);

    await user.keyboard("a");
    const input = screen.getByPlaceholderText("Type a medication name...") as HTMLInputElement;
    await user.click(screen.getByText(visibleMedications[0].name));

    expect(input.value).toBe("");
    expect(screen.getByText(visibleMedications[1].name)).toBeDefined();
  });

  it("shows an empty message once every medication has been added", async () => {
    const user = userEvent.setup();
    render(<AppShell>content</AppShell>);

    await user.keyboard("a");
    const input = screen.getByPlaceholderText("Type a medication name...") as HTMLInputElement;

    for (const medication of medications) {
      if (medication.slug === "gospel") {
        await user.type(input, "gospel");
      }
      await user.click(screen.getByText(medication.name));
    }

    expect(screen.getByText("No more medications to add.")).toBeDefined();
  });

  it("adds a medication that is not in the default list when searching for it", async () => {
    const user = userEvent.setup();
    render(<AppShell>content</AppShell>);

    await user.keyboard("a");
    await user.type(screen.getByPlaceholderText("Type a medication name..."), "gospel");
    await user.click(screen.getByText(hiddenMedication.name));

    await user.keyboard("{Escape}");
    expect(screen.getByRole("link", { name: hiddenMedication.name })).toBeDefined();
  });
});

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

  it("deletes a medication through its action button", async () => {
    const user = await renderWithMedications("boots", "corner");

    await user.click(screen.getByRole("button", { name: "Delete Corner" }));

    expect(screen.queryByRole("link", { name: "Corner" })).toBeNull();
  });
});

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

  async function closeSidebar(user: ReturnType<typeof userEvent.setup>) {
    await user.keyboard("{Control>}b{/Control}");
  }

  it("shows the Ctrl+B toggle hint in the sidebar footer", async () => {
    await renderWithMedications("boots");

    expect(screen.getByText("toggle")).toBeDefined();
  });

  it("closes the sidebar with Ctrl+B and reopens it with Ctrl+B", async () => {
    const user = await renderWithMedications("boots");

    await closeSidebar(user);

    expect(screen.queryByRole("link", { name: "Boots" })).toBeNull();
    expect(screen.getByTestId("sidebar-wrapper").getAttribute("aria-hidden")).toBe("true");

    await closeSidebar(user);

    expect(screen.getByRole("link", { name: "Boots" })).toBeDefined();
    expect(screen.getByTestId("sidebar-wrapper").getAttribute("aria-hidden")).toBe("false");
  });

  it("focuses the main content area when the sidebar closes", async () => {
    const user = await renderWithMedications("boots");

    await closeSidebar(user);

    expect(document.activeElement).toBe(screen.getByTestId("main-content"));
  });

  it("toggles the sidebar with Ctrl+B at narrow screen sizes", async () => {
    vi.mocked(useIsMobile).mockReturnValue(true);
    const user = await renderWithMedications("boots");

    await closeSidebar(user);

    expect(screen.queryByRole("link", { name: "Boots" })).toBeNull();
    expect(screen.getByTestId("sidebar-wrapper").getAttribute("aria-hidden")).toBe("true");

    await closeSidebar(user);

    expect(screen.getByRole("link", { name: "Boots" })).toBeDefined();
  });

  it("does nothing on 'x' when the sidebar is closed", async () => {
    const user = await renderWithMedications("boots", "corner");

    await closeSidebar(user);
    await user.keyboard("x");
    await closeSidebar(user);

    expect(screen.getByRole("link", { name: "Corner" })).toBeDefined();
  });

  it("does nothing on Enter when the sidebar is closed", async () => {
    const user = await renderWithMedications("boots");

    await closeSidebar(user);
    await user.keyboard("{Enter}");

    expect(pushMock).not.toHaveBeenCalled();
  });

  it("still opens the add command box with 'a' when the sidebar is closed", async () => {
    const user = await renderWithMedications("boots");

    await closeSidebar(user);
    await user.keyboard("a");

    expect(screen.getByPlaceholderText("Type a medication name...")).toBeDefined();
  });

  it("scrolls the main content with 'j' and 'k' when the sidebar is closed", async () => {
    const scrollBy = stubScrollBy();
    const user = await renderWithMedications("boots");

    await closeSidebar(user);
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