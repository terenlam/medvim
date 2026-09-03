import { render, screen, fireEvent } from "@testing-library/react";
import { CommandWithShortcuts } from "./command-box";

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeAll(() => {
  globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
  Element.prototype.scrollIntoView = () => {};
});

function pressKey(key: string, target?: Window | Element) {
  fireEvent.keyDown(target ?? window, { key });
}

describe("CommandWithShortcuts", () => {
  it("has no button to open the menu", () => {
    render(<CommandWithShortcuts />);
    expect(
      screen.queryByRole("button", { name: "Open Menu" })
    ).toBeNull();
  });

  it("opens the command box when pressing 'a' in normal mode", () => {
    render(<CommandWithShortcuts />);
    expect(
      screen.queryByPlaceholderText("Type a command or search...")
    ).toBeNull();

    pressKey("a");

    expect(
      screen.getByPlaceholderText("Type a command or search...")
    ).toBeDefined();
  });

  it("does not open when typing 'a' into another text field", () => {
    render(<CommandWithShortcuts />);
    const field = document.createElement("input");
    document.body.appendChild(field);

    pressKey("a", field);

    expect(
      screen.queryByPlaceholderText("Type a command or search...")
    ).toBeNull();
    document.body.removeChild(field);
  });

  it("types 'a' into the input instead of reopening when open", () => {
    render(<CommandWithShortcuts />);

    pressKey("a");

    const input = screen.getByPlaceholderText(
      "Type a command or search..."
    ) as HTMLInputElement;
    input.focus();

    // In insert mode the 'a' goes to the focused input; it does not
    // toggle/reopen the box.
    pressKey("a", input);
    expect(
      screen.getByPlaceholderText("Type a command or search...")
    ).toBeDefined();

    fireEvent.change(input, { target: { value: "a" } });
    expect(input.value).toBe("a");
  });
});
