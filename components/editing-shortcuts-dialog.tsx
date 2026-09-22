"use client";

import { useState } from "react";
import { useExtracted } from "next-intl";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { isEditingHelpShortcut } from "@/lib/edit-shortcuts";

/**
 * Readline-style editing shortcuts. `id` only identifies a row (React key and
 * label lookup) — the human-readable label is extracted from
 * `useEditingShortcutLabels`, and key names stay literal.
 */
export const EDITING_SHORTCUTS: ReadonlyArray<{
  keys: ReadonlyArray<string>;
  id:
    | "start"
    | "end"
    | "charLeft"
    | "charRight"
    | "wordLeft"
    | "wordRight"
    | "delWord"
    | "delChar"
    | "delForward"
    | "delWordFwd"
    | "delToStart";
}> = [
  { keys: ["Ctrl", "A"], id: "start" },
  { keys: ["Ctrl", "E"], id: "end" },
  { keys: ["Ctrl", "B"], id: "charLeft" },
  { keys: ["Ctrl", "F"], id: "charRight" },
  { keys: ["Alt", "B"], id: "wordLeft" },
  { keys: ["Alt", "F"], id: "wordRight" },
  { keys: ["Ctrl", "Alt", "H"], id: "delWord" },
  { keys: ["Ctrl", "H"], id: "delChar" },
  { keys: ["Ctrl", "D"], id: "delForward" },
  { keys: ["Alt", "D"], id: "delWordFwd" },
  { keys: ["Ctrl", "U"], id: "delToStart" },
];

type EditingShortcutId = (typeof EDITING_SHORTCUTS)[number]["id"];

/**
 * Extracted labels, keyed by shortcut id.
 *
 * Messages must be string literals passed to `t` inside the function body that
 * created it, so the labels live here and the list above only looks them up.
 * These are emacs/readline editing command names, so each description explains
 * what the command does.
 */
function useEditingShortcutLabels(): Record<EditingShortcutId, string> {
  const t = useExtracted();

  return {
    start: t({ message: "start", description: "Editing command: move the cursor to the start of the line" }),
    end: t({ message: "end", description: "Editing command: move the cursor to the end of the line" }),
    charLeft: t({ message: "char left", description: "Editing command: move the cursor one character left" }),
    charRight: t({ message: "char right", description: "Editing command: move the cursor one character right" }),
    wordLeft: t({ message: "word left", description: "Editing command: move the cursor one word left" }),
    wordRight: t({ message: "word right", description: "Editing command: move the cursor one word right" }),
    delWord: t({ message: "del word", description: "Editing command: delete the word before the cursor" }),
    delChar: t({ message: "del char", description: "Editing command: delete the character before the cursor" }),
    delForward: t({ message: "del forward", description: "Editing command: delete the character after the cursor" }),
    delWordFwd: t({ message: "del word fwd", description: "Editing command: delete the word after the cursor" }),
    delToStart: t({ message: "del to start", description: "Editing command: delete everything before the cursor" }),
  };
}

type HelpKeyEvent = Pick<KeyboardEvent, "key" | "ctrlKey" | "metaKey" | "altKey" | "shiftKey"> & {
  preventDefault: () => void;
};

export function useEditingShortcutsHelp() {
  const [helpOpen, setHelpOpen] = useState(false);

  function handleHelpKeyDown(event: HelpKeyEvent): boolean {
    if (isEditingHelpShortcut(event)) {
      event.preventDefault();
      setHelpOpen(true);
      return true;
    }
    return false;
  }

  return { helpOpen, setHelpOpen, handleHelpKeyDown };
}

export function EditingShortcutsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useExtracted();
  const labels = useEditingShortcutLabels();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t({ message: "Editing shortcuts", description: "Title of the editing shortcuts help dialog" })}</DialogTitle>
          <DialogDescription>
            {t({
              message: "Keyboard shortcuts available while editing text.",
              description: "Subtitle of the editing shortcuts help dialog",
            })}
          </DialogDescription>
        </DialogHeader>
        <div data-testid="editing-shortcuts-scroll" className="-mx-4 max-h-77 overflow-y-auto px-4">
          <ul className="flex flex-col gap-2 py-1">
            {EDITING_SHORTCUTS.map((shortcut) => (
              <li
                key={shortcut.id}
                data-shortcut-id={shortcut.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-muted-foreground">{labels[shortcut.id]}</span>
                <KbdGroup>
                  {shortcut.keys.map((key, index) => (
                    <span key={key} className="inline-flex items-center gap-1">
                      {index > 0 && <span aria-hidden="true">+</span>}
                      <Kbd>{key}</Kbd>
                    </span>
                  ))}
                </KbdGroup>
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
