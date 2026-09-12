/** @vitest-environment happy-dom */
import {
  hiddenMedication,
  openSearch,
  pushMock,
  searchPlaceholder,
  visibleMedications,
} from "./command-box.test-utils";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppShell } from "./app-shell";

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

  it("moves to the previous medication with Ctrl+K", async () => {
    const user = userEvent.setup();
    render(<AppShell>content</AppShell>);

    await openSearch(user);
    const input = screen.getByPlaceholderText(searchPlaceholder) as HTMLInputElement;
    input.focus();

    await user.keyboard("{Control>}j{/Control}");
    await user.keyboard("{Control>}k{/Control}");

    const bench = screen.getByRole("option", { name: /Bench/i });
    expect(bench.getAttribute("aria-selected")).toBe("true");
  });

  it("shows the Ctrl+J and Ctrl+K navigation keybindings", async () => {
    const user = userEvent.setup();
    render(<AppShell>content</AppShell>);

    await openSearch(user);

    expect(screen.getByText("J").closest("[data-slot='kbd-group']")?.textContent).toContain(
      "Ctrl+J",
    );
    expect(screen.getByText("K").closest("[data-slot='kbd-group']")?.textContent).toContain(
      "Ctrl+K",
    );
  });
});