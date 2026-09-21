type HelpShortcutEvent = Pick<
  KeyboardEvent,
  "key" | "ctrlKey" | "metaKey" | "altKey" | "shiftKey"
>;

export function isEditingHelpShortcut(event: HelpShortcutEvent): boolean {
  return (
    event.key === "/" &&
    event.ctrlKey &&
    !event.metaKey &&
    !event.altKey &&
    !event.shiftKey
  );
}

type EditableTextElement = HTMLInputElement | HTMLTextAreaElement;

type Gesture =
  | "home"
  | "end"
  | "delete-char"
  | "delete-word"
  | "delete-forward"
  | "delete-forward-word"
  | "kill-to-start"
  | "back-char"
  | "forward-char"
  | "back-word"
  | "forward-word";

const TEXT_INPUT_TYPES = new Set(["text", "search", "email", "url", "tel", "password"]);

function gestureFor(key: string, ctrl: boolean, alt: boolean): Gesture | null {
  if (ctrl && alt) {
    return key === "h" ? "delete-word" : null;
  }
  if (alt && !ctrl) {
    if (key === "b") return "back-word";
    if (key === "d") return "delete-forward-word";
    if (key === "f") return "forward-word";
    return null;
  }
  if (ctrl && !alt) {
    switch (key) {
      case "a":
        return "home";
      case "b":
        return "back-char";
      case "d":
        return "delete-forward";
      case "e":
        return "end";
      case "f":
        return "forward-char";
      case "h":
        return "delete-char";
      case "u":
        return "kill-to-start";
    }
  }
  return null;
}

export function wordStartBefore(value: string, index: number): number {
  let i = index;
  while (i > 0 && /\s/.test(value[i - 1])) i--;
  while (i > 0 && !/\s/.test(value[i - 1])) i--;
  while (i > 0 && /\s/.test(value[i - 1])) i--;
  return i;
}

export function wordEndAfter(value: string, index: number): number {
  let i = index;
  while (i < value.length && /\s/.test(value[i])) i++;
  while (i < value.length && !/\s/.test(value[i])) i++;
  return i;
}

function isTextEditable(element: EditableTextElement): boolean {
  if (element.disabled || element.readOnly) return false;
  if (element instanceof HTMLTextAreaElement) return true;
  return TEXT_INPUT_TYPES.has(element.type);
}

function setNativeValue(element: EditableTextElement, value: string) {
  const prototype =
    element instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
  const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");
  if (descriptor?.set) {
    descriptor.set.call(element, value);
  } else {
    element.value = value;
  }
}

function setValue(element: EditableTextElement, value: string, caret: number) {
  if (value === element.value) return;
  setNativeValue(element, value);
  element.setSelectionRange(caret, caret);
  element.dispatchEvent(new Event("input", { bubbles: true }));
}

export function handleEditingShortcut(element: EditableTextElement, event: KeyboardEvent): boolean {
  if (event.metaKey) return false;
  const gesture = gestureFor(event.key.toLowerCase(), event.ctrlKey, event.altKey);
  if (!gesture || !isTextEditable(element)) return false;

  event.preventDefault();

  const value = element.value;
  const start = element.selectionStart ?? value.length;
  const end = element.selectionEnd ?? start;

  switch (gesture) {
    case "home":
      element.setSelectionRange(0, 0);
      return true;
    case "end":
      element.setSelectionRange(value.length, value.length);
      return true;
    case "back-char":
      if (start !== end) {
        element.setSelectionRange(start, start);
      } else {
        element.setSelectionRange(Math.max(start - 1, 0), Math.max(start - 1, 0));
      }
      return true;
    case "forward-char":
      if (start !== end) {
        element.setSelectionRange(end, end);
      } else {
        element.setSelectionRange(Math.min(end + 1, value.length), Math.min(end + 1, value.length));
      }
      return true;
    case "back-word":
      if (start !== end) {
        element.setSelectionRange(start, start);
      } else {
        const wordStart = wordStartBefore(value, start);
        element.setSelectionRange(wordStart, wordStart);
      }
      return true;
    case "forward-word":
      if (start !== end) {
        element.setSelectionRange(end, end);
      } else {
        const wordEnd = wordEndAfter(value, start);
        element.setSelectionRange(wordEnd, wordEnd);
      }
      return true;
    case "delete-char":
      if (start !== end) {
        setValue(element, value.slice(0, start) + value.slice(end), start);
      } else if (start > 0) {
        setValue(element, value.slice(0, start - 1) + value.slice(start), start - 1);
      }
      return true;
    case "delete-word":
      if (start !== end) {
        setValue(element, value.slice(0, start) + value.slice(end), start);
      } else {
        const wordStart = wordStartBefore(value, start);
        if (wordStart !== start) {
          setValue(element, value.slice(0, wordStart) + value.slice(start), wordStart);
        }
      }
      return true;
    case "delete-forward":
      if (start !== end) {
        setValue(element, value.slice(0, start) + value.slice(end), start);
      } else if (start < value.length) {
        setValue(element, value.slice(0, start) + value.slice(start + 1), start);
      }
      return true;
    case "delete-forward-word":
      if (start !== end) {
        setValue(element, value.slice(0, start) + value.slice(end), start);
      } else {
        const wordEnd = wordEndAfter(value, start);
        if (wordEnd !== start) {
          setValue(element, value.slice(0, start) + value.slice(wordEnd), start);
        }
      }
      return true;
    case "kill-to-start":
      if (start !== end) {
        setValue(element, value.slice(0, start) + value.slice(end), start);
      } else if (start > 0) {
        setValue(element, value.slice(start), 0);
      }
      return true;
  }
}
