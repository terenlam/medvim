/** @vitest-environment happy-dom */
import { namePlaceholder, openSearch, searchPlaceholder } from "./command-box.test-utils";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithIntl } from "@/test/intl";
import { AppShell } from "./app-shell";

describe("command box editing shortcuts help", () => {
  it("shows the Ctrl+/ hint in the footer", async () => {
    const user = userEvent.setup();
    renderWithIntl(<AppShell>content</AppShell>);

    await openSearch(user);

    expect(screen.getByText("/").closest("[data-slot='kbd-group']")?.textContent).toContain(
      "Ctrl+/",
    );
    expect(screen.getByText("shortcuts")).toBeDefined();
    expect(screen.getByText("next")).toBeDefined();
    expect(screen.getByText("select")).toBeDefined();
  });

  it("opens the editing shortcuts dialog with Ctrl+/ in the search box", async () => {
    const user = userEvent.setup();
    renderWithIntl(<AppShell>content</AppShell>);

    await openSearch(user);
    const input = screen.getByPlaceholderText(searchPlaceholder) as HTMLInputElement;
    await user.type(input, "bench");
    await user.keyboard("{Control>}/{/Control}");

    expect(screen.getByRole("dialog", { name: "Editing shortcuts" })).toBeDefined();
    expect(screen.getByTestId("editing-shortcuts-scroll")).toBeDefined();
    expect(input.value).toBe("bench");
  });

  it("opens the editing shortcuts dialog with Ctrl+/ in the add box", async () => {
    const user = userEvent.setup();
    renderWithIntl(<AppShell>content</AppShell>);

    await user.keyboard("a");
    const input = screen.getByPlaceholderText(namePlaceholder) as HTMLInputElement;
    await user.type(input, "bench");
    await user.keyboard("{Control>}/{/Control}");

    expect(screen.getByRole("dialog", { name: "Editing shortcuts" })).toBeDefined();
    expect(input.value).toBe("bench");
  });

  it("keeps the command box open after closing the help dialog", async () => {
    const user = userEvent.setup();
    renderWithIntl(<AppShell>content</AppShell>);

    await openSearch(user);
    const input = screen.getByPlaceholderText(searchPlaceholder) as HTMLInputElement;
    await user.keyboard("{Control>}/{/Control}");

    expect(screen.getByRole("dialog", { name: "Editing shortcuts" })).toBeDefined();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog", { name: "Editing shortcuts" })).toBeNull();
    expect(screen.getByPlaceholderText(searchPlaceholder)).toBeDefined();
    expect(input.value).toBe("");
  });
});
