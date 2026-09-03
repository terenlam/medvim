import { render, screen, fireEvent } from "@testing-library/react";
import { CommandWithShortcuts } from "./command-box";

// cmdk relies on browser APIs that jsdom doesn't provide, so mock them
// to prevent environment-related errors while testing the component.
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
    expect(screen.queryByRole("button", { name: "Open Menu" })).toBeNull();
  });

  it("does not open the command box when 'a' is not pressed in normal mode", () => {
    render(<CommandWithShortcuts />);
    expect(screen.queryByPlaceholderText("Type a command or search...")).toBeNull();
  });

  it("opens the command box when pressing 'a' in normal mode", () => {
    render(<CommandWithShortcuts />);

    pressKey("a");

    expect(screen.getByPlaceholderText("Type a command or search...")).toBeDefined();
  });

  it("does not open when typing 'a' into another text field", () => {
    render(<CommandWithShortcuts />);
    const field = document.createElement("input");
    document.body.appendChild(field);

    pressKey("a", field);

    expect(screen.queryByPlaceholderText("Type a command or search...")).toBeNull();
    onTestFinished(() => {
      document.body.removeChild(field);
    });
  });

  it("types 'a' into the input instead of reopening when open", () => {
    render(<CommandWithShortcuts />);

    pressKey("a");

    const input = screen.getByPlaceholderText("Type a command or search...") as HTMLInputElement;
    input.focus();

    pressKey("a", input);
    expect(screen.getByPlaceholderText("Type a command or search...")).toBeDefined();

    fireEvent.change(input, { target: { value: "a" } });
    expect(input.value).toBe("a");
  });
});
