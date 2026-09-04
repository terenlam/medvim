/** @vitest-environment happy-dom */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CommandWithShortcuts } from "./command-box";

describe("CommandWithShortcuts", () => {
  it("has no button to open the menu", () => {
    render(<CommandWithShortcuts />);
    expect(screen.queryByRole("button", { name: "Open Menu" })).toBeNull();
  });

  it("does not open the command box when 'a' is not pressed in normal mode", () => {
    render(<CommandWithShortcuts />);
    expect(screen.queryByPlaceholderText("Type a command or search...")).toBeNull();
  });

  it("opens the command box when pressing 'a' in normal mode", async () => {
    const user = userEvent.setup();
    render(<CommandWithShortcuts />);

    await user.keyboard("a");

    expect(screen.getByPlaceholderText("Type a command or search...")).toBeDefined();
  });

  it("does not open when typing 'a' into another text field", async () => {
    const user = userEvent.setup();
    render(<CommandWithShortcuts />);

    const field = document.createElement("input");
    document.body.appendChild(field);

    await user.type(field, "a");

    expect(screen.queryByPlaceholderText("Type a command or search...")).toBeNull();
    onTestFinished(() => {
      document.body.removeChild(field);
    });
  });

  it("types 'a' into the input instead of reopening when open", async () => {
    const user = userEvent.setup();
    render(<CommandWithShortcuts />);

    await user.keyboard("a");
    const input = screen.getByPlaceholderText("Type a command or search...") as HTMLInputElement;
    input.focus();

    await user.keyboard("a");
    expect(screen.getByPlaceholderText("Type a command or search...")).toBeDefined();
    expect(input.value).toBe("a");
  });
  it("closes the command box when pressing Escape", async () => {
    const user = userEvent.setup();
    render(<CommandWithShortcuts />);

    await user.keyboard("{Esc}");

    expect(screen.queryByPlaceholderText("Type a command or search...")).toBeNull();
  });
});

