"use client";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { isEditingHelpShortcut } from "@/lib/edit-shortcuts";

export const EDITING_SHORTCUTS: ReadonlyArray<{
  keys: ReadonlyArray<string>;
  label: string;
}> = [
  { keys: ["Ctrl", "A"], label: "start" },
  { keys: ["Ctrl", "E"], label: "end" },
  { keys: ["Ctrl", "B"], label: "char left" },
  { keys: ["Ctrl", "F"], label: "char right" },
  { keys: ["Alt", "B"], label: "word left" },
  { keys: ["Alt", "F"], label: "word right" },
  { keys: ["Ctrl", "Alt", "H"], label: "del word" },
  { keys: ["Ctrl", "H"], label: "del char" },
  { keys: ["Ctrl", "D"], label: "del forward" },
  { keys: ["Alt", "D"], label: "del word fwd" },
  { keys: ["Ctrl", "U"], label: "del to start" },
];

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editing shortcuts</DialogTitle>
          <DialogDescription>Keyboard shortcuts available while editing text.</DialogDescription>
        </DialogHeader>
        <div data-testid="editing-shortcuts-scroll" className="-mx-4 max-h-77 overflow-y-auto px-4">
          <ul className="flex flex-col gap-2 py-1">
            {EDITING_SHORTCUTS.map((shortcut) => (
              <li key={shortcut.label} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{shortcut.label}</span>
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
