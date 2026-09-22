/**
 * True when the event target is a text-editable area (input, textarea or
 * contenteditable) — keyboard shortcuts must not fire while the user is
 * typing.
 *
 * Note: `isContentEditable` is relied on for contenteditable subtrees; it is
 * implemented by real browsers and happy-dom, but not by jsdom — tests for
 * this helper run under happy-dom.
 */
export function isEditableTarget(target: EventTarget | null): boolean {
  const element = target as HTMLElement | null;
  if (!element) return false;

  return element.tagName === "INPUT" || element.tagName === "TEXTAREA" || element.isContentEditable;
}
