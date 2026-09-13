import { handleEditingShortcut, wordEndAfter, wordStartBefore } from "./edit-shortcuts";

function makeInput(value: string, start: number, end = start): HTMLInputElement {
  const element = document.createElement("input");
  element.value = value;
  element.setSelectionRange(start, end);
  return element;
}

function makeTextarea(value: string, start: number, end = start): HTMLTextAreaElement {
  const element = document.createElement("textarea");
  element.value = value;
  element.setSelectionRange(start, end);
  return element;
}

function press(
  key: string,
  modifiers: { ctrl?: boolean; alt?: boolean; meta?: boolean } = {},
): KeyboardEvent {
  return new KeyboardEvent("keydown", {
    key,
    bubbles: true,
    cancelable: true,
    ctrlKey: modifiers.ctrl ?? false,
    altKey: modifiers.alt ?? false,
    metaKey: modifiers.meta ?? false,
  });
}

describe("wordStartBefore", () => {
  it("points at the start of a single word", () => {
    expect(wordStartBefore("hello", 5)).toBe(0);
  });

  it("skips the whitespace preceding the word", () => {
    expect(wordStartBefore("a b", 3)).toBe(1);
  });

  it("skips a run of whitespace before the word", () => {
    expect(wordStartBefore("hello   world", 12)).toBe(5);
  });

  it("finds a word boundary mid-word", () => {
    expect(wordStartBefore("hello world", 7)).toBe(5);
  });

  it("treats newlines as whitespace", () => {
    expect(wordStartBefore("ab\ncd", 5)).toBe(2);
  });
});

describe("wordEndAfter", () => {
  it("points at the start of the next word", () => {
    expect(wordEndAfter("hello world", 0)).toBe(5);
  });

  it("skips the whitespace before the next word", () => {
    expect(wordEndAfter("hello world", 5)).toBe(11);
  });

  it("clamps at the end of the field", () => {
    expect(wordEndAfter("hello world", 11)).toBe(11);
  });

  it("skips a run of leading whitespace", () => {
    expect(wordEndAfter("  hello", 0)).toBe(7);
  });
});

describe("handleEditingShortcut", () => {
  it("deletes the character to the left with Ctrl+H", () => {
    const element = makeInput("hello", 5);
    const event = press("h", { ctrl: true });

    expect(handleEditingShortcut(element, event)).toBe(true);
    expect(event.defaultPrevented).toBe(true);
    expect(element.value).toBe("hell");
    expect(element.selectionStart).toBe(4);
  });

  it("does nothing with Ctrl+H at the start of the field", () => {
    const element = makeInput("hello", 0);
    const event = press("h", { ctrl: true });

    expect(handleEditingShortcut(element, event)).toBe(true);
    expect(element.value).toBe("hello");
    expect(element.selectionStart).toBe(0);
  });

  it("deletes the selection with Ctrl+H", () => {
    const element = makeInput("hello world", 5, 11);
    const event = press("h", { ctrl: true });

    expect(handleEditingShortcut(element, event)).toBe(true);
    expect(element.value).toBe("hello");
    expect(element.selectionStart).toBe(5);
  });

  it("deletes the word to the left with Ctrl+Alt+H", () => {
    const element = makeInput("a b", 3);
    const event = press("h", { ctrl: true, alt: true });

    expect(handleEditingShortcut(element, event)).toBe(true);
    expect(event.defaultPrevented).toBe(true);
    expect(element.value).toBe("a");
    expect(element.selectionStart).toBe(1);
  });

  it("deletes a run of whitespace with the word with Ctrl+Alt+H", () => {
    const element = makeInput("hello   world", 13);
    const event = press("h", { ctrl: true, alt: true });

    expect(handleEditingShortcut(element, event)).toBe(true);
    expect(element.value).toBe("hello");
    expect(element.selectionStart).toBe(5);
  });

  it("deletes mid-word text back to the word start with Ctrl+Alt+H", () => {
    const element = makeInput("hello world", 7);
    const event = press("h", { ctrl: true, alt: true });

    expect(handleEditingShortcut(element, event)).toBe(true);
    expect(element.value).toBe("helloorld");
    expect(element.selectionStart).toBe(5);
  });

  it("deletes the selection with Ctrl+Alt+H", () => {
    const element = makeInput("hello world", 5, 11);
    const event = press("h", { ctrl: true, alt: true });

    expect(handleEditingShortcut(element, event)).toBe(true);
    expect(element.value).toBe("hello");
    expect(element.selectionStart).toBe(5);
  });

  it("deletes the character under the caret with Ctrl+D", () => {
    const element = makeInput("hello", 2);
    const event = press("d", { ctrl: true });

    expect(handleEditingShortcut(element, event)).toBe(true);
    expect(event.defaultPrevented).toBe(true);
    expect(element.value).toBe("helo");
    expect(element.selectionStart).toBe(2);
  });

  it("does nothing with Ctrl+D at the end of the field", () => {
    const element = makeInput("hello", 5);
    const event = press("d", { ctrl: true });

    expect(handleEditingShortcut(element, event)).toBe(true);
    expect(element.value).toBe("hello");
    expect(element.selectionStart).toBe(5);
  });

  it("deletes the selection with Ctrl+D", () => {
    const element = makeInput("hello world", 5, 11);
    const event = press("d", { ctrl: true });

    expect(handleEditingShortcut(element, event)).toBe(true);
    expect(element.value).toBe("hello");
    expect(element.selectionStart).toBe(5);
  });

  it("deletes the next word with Alt+D from inside a word", () => {
    const element = makeInput("hello world", 7);
    const event = press("d", { alt: true });

    expect(handleEditingShortcut(element, event)).toBe(true);
    expect(event.defaultPrevented).toBe(true);
    expect(element.value).toBe("hello w");
    expect(element.selectionStart).toBe(7);
  });

  it("deletes the next word with Alt+D from the whitespace before it", () => {
    const element = makeInput("hello world", 5);
    const event = press("d", { alt: true });

    expect(handleEditingShortcut(element, event)).toBe(true);
    expect(element.value).toBe("hello");
    expect(element.selectionStart).toBe(5);
  });

  it("does nothing with Alt+D at the end of the field", () => {
    const element = makeInput("hello world", 11);
    const event = press("d", { alt: true });

    expect(handleEditingShortcut(element, event)).toBe(true);
    expect(element.value).toBe("hello world");
    expect(element.selectionStart).toBe(11);
  });

  it("deletes the selection with Alt+D", () => {
    const element = makeInput("hello world", 5, 11);
    const event = press("d", { alt: true });

    expect(handleEditingShortcut(element, event)).toBe(true);
    expect(element.value).toBe("hello");
    expect(element.selectionStart).toBe(5);
  });

  it("deletes from the caret to the start with Ctrl+U", () => {
    const element = makeInput("hello", 3);
    const event = press("u", { ctrl: true });

    expect(handleEditingShortcut(element, event)).toBe(true);
    expect(event.defaultPrevented).toBe(true);
    expect(element.value).toBe("lo");
    expect(element.selectionStart).toBe(0);
  });

  it("does nothing with Ctrl+U at the start of the field", () => {
    const element = makeInput("hello", 0);
    const event = press("u", { ctrl: true });

    expect(handleEditingShortcut(element, event)).toBe(true);
    expect(element.value).toBe("hello");
    expect(element.selectionStart).toBe(0);
  });

  it("deletes the selection with Ctrl+U", () => {
    const element = makeInput("hello world", 5, 8);
    const event = press("u", { ctrl: true });

    expect(handleEditingShortcut(element, event)).toBe(true);
    expect(element.value).toBe("hellorld");
    expect(element.selectionStart).toBe(5);
  });

  it("does nothing with Ctrl+Alt+H at the start of the field", () => {
    const element = makeInput("hi", 0);
    const event = press("h", { ctrl: true, alt: true });

    expect(handleEditingShortcut(element, event)).toBe(true);
    expect(element.value).toBe("hi");
    expect(element.selectionStart).toBe(0);
  });

  it("leaves Ctrl+W unhandled so the browser reserved behavior wins", () => {
    const element = makeInput("hello world", 5);
    const event = press("w", { ctrl: true });

    expect(handleEditingShortcut(element, event)).toBe(false);
    expect(event.defaultPrevented).toBe(false);
    expect(element.value).toBe("hello world");
  });

  it("leaves Ctrl+K unhandled so the command box can navigate with it", () => {
    const element = makeInput("hello world", 5);
    const event = press("k", { ctrl: true });

    expect(handleEditingShortcut(element, event)).toBe(false);
    expect(event.defaultPrevented).toBe(false);
    expect(element.value).toBe("hello world");
  });

  it("moves the caret to the start with Ctrl+A", () => {
    const element = makeInput("hello", 3);
    const event = press("a", { ctrl: true });

    expect(handleEditingShortcut(element, event)).toBe(true);
    expect(event.defaultPrevented).toBe(true);
    expect(element.selectionStart).toBe(0);
    expect(element.selectionEnd).toBe(0);
  });

  it("collapses an active selection with Ctrl+A", () => {
    const element = makeInput("hello", 2, 4);
    const event = press("a", { ctrl: true });

    expect(handleEditingShortcut(element, event)).toBe(true);
    expect(element.selectionStart).toBe(0);
    expect(element.selectionEnd).toBe(0);
  });

  it("moves the caret to the end with Ctrl+E", () => {
    const element = makeInput("hello", 3);
    const event = press("e", { ctrl: true });

    expect(handleEditingShortcut(element, event)).toBe(true);
    expect(element.selectionStart).toBe(5);
    expect(element.selectionEnd).toBe(5);
  });

  it("collapses an active selection with Ctrl+E", () => {
    const element = makeInput("hello", 2, 4);
    const event = press("e", { ctrl: true });

    expect(handleEditingShortcut(element, event)).toBe(true);
    expect(element.selectionStart).toBe(5);
    expect(element.selectionEnd).toBe(5);
  });

  it("moves the caret one character back with Ctrl+B", () => {
    const element = makeInput("hello", 3);
    const event = press("b", { ctrl: true });

    expect(handleEditingShortcut(element, event)).toBe(true);
    expect(event.defaultPrevented).toBe(true);
    expect(element.selectionStart).toBe(2);
    expect(element.selectionEnd).toBe(2);
  });

  it("does not move the caret back past the start with Ctrl+B", () => {
    const element = makeInput("hello", 0);
    const event = press("b", { ctrl: true });

    expect(handleEditingShortcut(element, event)).toBe(true);
    expect(element.selectionStart).toBe(0);
  });

  it("collapses the selection to the back edge with Ctrl+B", () => {
    const element = makeInput("hello", 2, 4);
    const event = press("b", { ctrl: true });

    expect(handleEditingShortcut(element, event)).toBe(true);
    expect(element.selectionStart).toBe(2);
    expect(element.selectionEnd).toBe(2);
  });

  it("moves the caret one character forward with Ctrl+F", () => {
    const element = makeInput("hello", 3);
    const event = press("f", { ctrl: true });

    expect(handleEditingShortcut(element, event)).toBe(true);
    expect(event.defaultPrevented).toBe(true);
    expect(element.selectionStart).toBe(4);
    expect(element.selectionEnd).toBe(4);
  });

  it("does not move the caret forward past the end with Ctrl+F", () => {
    const element = makeInput("hello", 5);
    const event = press("f", { ctrl: true });

    expect(handleEditingShortcut(element, event)).toBe(true);
    expect(element.selectionStart).toBe(5);
  });

  it("collapses the selection to the forward edge with Ctrl+F", () => {
    const element = makeInput("hello", 2, 4);
    const event = press("f", { ctrl: true });

    expect(handleEditingShortcut(element, event)).toBe(true);
    expect(element.selectionStart).toBe(4);
    expect(element.selectionEnd).toBe(4);
  });

  it("moves the caret one word back with Alt+B", () => {
    const element = makeInput("hello world", 11);
    const event = press("b", { alt: true });

    expect(handleEditingShortcut(element, event)).toBe(true);
    expect(event.defaultPrevented).toBe(true);
    expect(element.selectionStart).toBe(5);
    expect(element.selectionEnd).toBe(5);
  });

  it("finds a word boundary mid-word with Alt+B", () => {
    const element = makeInput("hello world", 7);
    const event = press("b", { alt: true });

    expect(handleEditingShortcut(element, event)).toBe(true);
    expect(element.selectionStart).toBe(5);
  });

  it("does not move the caret back past the start with Alt+B", () => {
    const element = makeInput("hello", 0);
    const event = press("b", { alt: true });

    expect(handleEditingShortcut(element, event)).toBe(true);
    expect(element.selectionStart).toBe(0);
  });

  it("collapses the selection to the back edge with Alt+B", () => {
    const element = makeInput("hello world", 5, 11);
    const event = press("b", { alt: true });

    expect(handleEditingShortcut(element, event)).toBe(true);
    expect(element.selectionStart).toBe(5);
    expect(element.selectionEnd).toBe(5);
  });

  it("moves the caret one word forward with Alt+F", () => {
    const element = makeInput("hello world", 0);
    const event = press("f", { alt: true });

    expect(handleEditingShortcut(element, event)).toBe(true);
    expect(event.defaultPrevented).toBe(true);
    expect(element.selectionStart).toBe(5);
    expect(element.selectionEnd).toBe(5);
  });

  it("skips the whitespace between words with Alt+F", () => {
    const element = makeInput("hello world", 5);
    const event = press("f", { alt: true });

    expect(handleEditingShortcut(element, event)).toBe(true);
    expect(element.selectionStart).toBe(11);
  });

  it("does not move the caret forward past the end with Alt+F", () => {
    const element = makeInput("hello", 5);
    const event = press("f", { alt: true });

    expect(handleEditingShortcut(element, event)).toBe(true);
    expect(element.selectionStart).toBe(5);
  });

  it("collapses the selection to the forward edge with Alt+F", () => {
    const element = makeInput("hello world", 0, 6);
    const event = press("f", { alt: true });

    expect(handleEditingShortcut(element, event)).toBe(true);
    expect(element.selectionStart).toBe(6);
    expect(element.selectionEnd).toBe(6);
  });

  it("does not dispatch an input event when the caret moves", () => {
    const element = makeInput("hello", 3);
    const onChange = vi.fn();
    element.addEventListener("input", onChange);

    handleEditingShortcut(element, press("b", { ctrl: true }));

    expect(onChange).not.toHaveBeenCalled();
  });

  it("dispatches an input event when the value changes", () => {
    const element = makeInput("hello", 5);
    const onChange = vi.fn();
    element.addEventListener("input", onChange);

    handleEditingShortcut(element, press("h", { ctrl: true }));

    expect(onChange).toHaveBeenCalledOnce();
    expect((onChange.mock.calls[0]![0] as Event).target).toBe(element);
  });

  it("does not dispatch an input event when the value is unchanged", () => {
    const element = makeInput("hello", 3);
    const onChange = vi.fn();
    element.addEventListener("input", onChange);

    handleEditingShortcut(element, press("a", { ctrl: true }));

    expect(onChange).not.toHaveBeenCalled();
  });

  it("dispatches an input event when a forward-delete changes the value", () => {
    const element = makeInput("hello", 2);
    const onChange = vi.fn();
    element.addEventListener("input", onChange);

    handleEditingShortcut(element, press("d", { ctrl: true }));

    expect(onChange).toHaveBeenCalledOnce();
    expect((onChange.mock.calls[0]![0] as Event).target).toBe(element);
  });

  it("does not dispatch an input event when a forward-delete is a no-op", () => {
    const element = makeInput("hello", 5);
    const onChange = vi.fn();
    element.addEventListener("input", onChange);

    handleEditingShortcut(element, press("d", { ctrl: true }));

    expect(onChange).not.toHaveBeenCalled();
  });

  it.each<[string, string, { ctrl?: boolean; alt?: boolean; meta?: boolean }]>([
    ["plain h", "h", {}],
    ["Alt+H", "h", { alt: true }],
    ["Ctrl+Alt+Meta+H", "h", { ctrl: true, alt: true, meta: true }],
    ["plain w", "w", {}],
    ["Ctrl+W", "w", { ctrl: true }],
    ["Ctrl+Alt+W", "w", { ctrl: true, alt: true }],
    ["Ctrl+Meta+A", "a", { ctrl: true, meta: true }],
    ["plain b", "b", {}],
    ["Ctrl+Alt+B", "b", { ctrl: true, alt: true }],
    ["Alt+Meta+B", "b", { alt: true, meta: true }],
    ["plain d", "d", {}],
    ["Ctrl+Alt+D", "d", { ctrl: true, alt: true }],
    ["Ctrl+Meta+D", "d", { ctrl: true, meta: true }],
    ["plain u", "u", {}],
    ["Alt+U", "u", { alt: true }],
    ["Ctrl+Meta+U", "u", { ctrl: true, meta: true }],
    ["plain f", "f", {}],
    ["Ctrl+Alt+F", "f", { ctrl: true, alt: true }],
    ["Alt+K", "k", { alt: true }],
    ["Ctrl+X", "x", { ctrl: true }],
  ])("leaves keys it does not handle untouched (%s)", (_label, key, modifiers) => {
    const element = makeInput("hello", 5);
    const event = press(key, modifiers);

    expect(handleEditingShortcut(element, event)).toBe(false);
    expect(event.defaultPrevented).toBe(false);
    expect(element.value).toBe("hello");
  });

  it("ignores Ctrl+A on a number input", () => {
    const element = document.createElement("input");
    element.type = "number";
    const event = press("a", { ctrl: true });

    expect(handleEditingShortcut(element, event)).toBe(false);
    expect(event.defaultPrevented).toBe(false);
  });

  it("ignores shortcuts on read-only and disabled inputs", () => {
    const readOnly = makeInput("hello", 5);
    readOnly.readOnly = true;
    const disabled = makeInput("hello", 5);
    disabled.disabled = true;

    expect(handleEditingShortcut(readOnly, press("h", { ctrl: true }))).toBe(false);
    expect(handleEditingShortcut(disabled, press("h", { ctrl: true }))).toBe(false);
  });

  it("applies the shortcuts inside a textarea", () => {
    const element = makeTextarea("a b", 3);

    expect(handleEditingShortcut(element, press("h", { ctrl: true, alt: true }))).toBe(true);
    expect(element.value).toBe("a");
    expect(element.selectionStart).toBe(1);
  });
});
