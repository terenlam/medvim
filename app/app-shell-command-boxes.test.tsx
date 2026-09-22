/** @vitest-environment happy-dom */
import { openSearch, searchPlaceholder } from "./command-box.test-utils";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppShell } from "./app-shell";
import { renderWithIntl } from "@/test/intl";

describe("AppShell command boxes", () => {
  it("does not open the search command box until 's' is pressed", () => {
    renderWithIntl(<AppShell>content</AppShell>);
    expect(screen.queryByPlaceholderText(searchPlaceholder)).toBeNull();
  });

  it("opens the search command box when pressing 's' in normal mode", async () => {
    const user = userEvent.setup();
    renderWithIntl(<AppShell>content</AppShell>);

    await user.keyboard("s");

    expect(screen.getByPlaceholderText(searchPlaceholder)).toBeDefined();
  });

  it("does not open when typing 's' into another text field", async () => {
    const user = userEvent.setup();
    renderWithIntl(<AppShell>content</AppShell>);

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
    renderWithIntl(<AppShell>content</AppShell>);

    await openSearch(user);
    const input = screen.getByPlaceholderText(searchPlaceholder) as HTMLInputElement;
    input.focus();

    await user.keyboard("s");
    expect(screen.getByPlaceholderText(searchPlaceholder)).toBeDefined();
    expect(input.value).toBe("s");
  });

  it("closes the search command box when pressing Escape", async () => {
    const user = userEvent.setup();
    renderWithIntl(<AppShell>content</AppShell>);

    await openSearch(user);
    await user.keyboard("{Escape}");

    expect(screen.queryByPlaceholderText(searchPlaceholder)).toBeNull();
  });
});