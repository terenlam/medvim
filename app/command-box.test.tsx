/** @vitest-environment happy-dom */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppShell } from "./app-shell";
import { medications } from "@/lib/medications/medications";

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

const visibleMedications = medications.slice(0, 5);
const hiddenMedication = medications[5];

const searchPlaceholder = "Type a command or search...";

function openSearch(user: ReturnType<typeof userEvent.setup>) {
  return user.keyboard("s");
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