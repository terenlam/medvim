/** @vitest-environment happy-dom */
import { hiddenMedication, visibleMedications } from "./command-box.test-utils";
import { medications } from "@/lib/medications/medications";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppShell } from "./app-shell";

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

    expect(
      screen.queryByRole("option", {
        name: new RegExp(visibleMedications[0].name),
      }),
    ).toBeNull();
    expect(
      screen.getByRole("option", {
        name: new RegExp(visibleMedications[1].name),
      }),
    ).toBeDefined();
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