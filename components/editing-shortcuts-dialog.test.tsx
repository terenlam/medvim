/** @vitest-environment happy-dom */
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithIntl } from "@/test/intl";
import { EDITING_SHORTCUTS } from "./editing-shortcuts-dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

describe("EDITING_SHORTCUTS", () => {
  it("contains the 11 editing hints", () => {
    expect(EDITING_SHORTCUTS.map(({ id }) => id)).toEqual([
      "start",
      "end",
      "charLeft",
      "charRight",
      "wordLeft",
      "wordRight",
      "delWord",
      "delChar",
      "delForward",
      "delWordFwd",
      "delToStart",
    ]);
  });
});

describe("editing shortcuts help", () => {
  it("opens the help dialog with Ctrl+/ in an Input without changing its value", async () => {
    const user = userEvent.setup();
    renderWithIntl(<Input defaultValue="abc" />);

    const input = screen.getByRole("textbox") as HTMLInputElement;
    await user.click(input);
    input.setSelectionRange(3, 3);
    await user.keyboard("{Control>}/{/Control}");

    expect(screen.getByRole("dialog", { name: "Editing shortcuts" })).toBeDefined();
    expect(input.value).toBe("abc");
    expect(screen.getByTestId("editing-shortcuts-scroll")).toBeDefined();
  });

  it("lists every editing shortcut in a scrollable region", async () => {
    const user = userEvent.setup();
    renderWithIntl(<Input defaultValue="abc" />);

    const input = screen.getByRole("textbox") as HTMLInputElement;
    await user.click(input);
    await user.keyboard("{Control>}/{/Control}");

    // One labelled row per shortcut, each with its own label: `useExtracted`
    // calls aren't compiled under Vitest, so the assertions stay on structure
    // rather than on the (translated) label copy.
    const rows = screen.getAllByRole("listitem");
    expect(rows.map((row) => row.getAttribute("data-shortcut-id"))).toEqual(
      EDITING_SHORTCUTS.map(({ id }) => id),
    );
    expect(new Set(rows.map((row) => row.textContent)).size).toBe(rows.length);
    expect(screen.getByTestId("editing-shortcuts-scroll").className).toContain("overflow-y-auto");
  });

  it("opens the help dialog with Ctrl+/ in a Textarea", async () => {
    const user = userEvent.setup();
    renderWithIntl(<Textarea defaultValue="hello" />);

    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    await user.click(textarea);
    await user.keyboard("{Control>}/{/Control}");

    expect(screen.getByRole("dialog", { name: "Editing shortcuts" })).toBeDefined();
    expect(textarea.value).toBe("hello");
  });

  it("does not open the help dialog for Ctrl+Shift+/ or a bare /", async () => {
    const user = userEvent.setup();
    renderWithIntl(<Input defaultValue="" />);

    const input = screen.getByRole("textbox") as HTMLInputElement;
    await user.click(input);
    await user.keyboard("{Control>}{Shift>}/{/Shift}{/Control}");

    expect(screen.queryByRole("dialog", { name: "Editing shortcuts" })).toBeNull();

    await user.keyboard("/");
    expect(screen.queryByRole("dialog", { name: "Editing shortcuts" })).toBeNull();
    expect(input.value).toBe("/");
  });

  it("closes the help dialog with Escape", async () => {
    const user = userEvent.setup();
    renderWithIntl(<Input defaultValue="abc" />);

    const input = screen.getByRole("textbox") as HTMLInputElement;
    await user.click(input);
    await user.keyboard("{Control>}/{/Control}");

    expect(screen.getByRole("dialog", { name: "Editing shortcuts" })).toBeDefined();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "Editing shortcuts" })).toBeNull();
  });
});
