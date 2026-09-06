"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { defaultFilter, useCommandState } from "cmdk";

import {
  Command,
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { medications } from "@/lib/medications/medications";

import { Kbd } from "@/components/ui/kbd";

const MAX_ITEMS = 5;

function MedicationCommandList({
  open,
  onSelect,
}: {
  open: boolean;
  onSelect: (slug: string) => void;
}) {
  const search = useCommandState((state) => state.search);

  const visible = medications
    .filter(({ name }) => defaultFilter(name, search) > 0)
    .slice(0, MAX_ITEMS);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      const index = Number(event.key) - 1;
      if (
        event.altKey &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.shiftKey &&
        index >= 0 &&
        index < MAX_ITEMS
      ) {
        const medication = visible[index];
        if (medication) {
          event.preventDefault();
          onSelect(medication.slug);
        }
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, visible, onSelect]);

  return (
    <CommandGroup heading="Medications">
      {visible.map((medication, index) => (
        <CommandItem
          key={medication.slug}
          value={medication.name}
          onSelect={() => onSelect(medication.slug)}
        >
          <span>{medication.name}</span>
          <CommandShortcut>
            <Kbd>Alt + {index + 1}</Kbd>
          </CommandShortcut>
        </CommandItem>
      ))}
    </CommandGroup>
  );
}

export function CommandWithShortcuts() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function openMedication(slug: string) {
    setOpen(false);
    router.push(`/${slug}`);
  }

  useEffect(() => {
    if (open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "a" && !event.metaKey && !event.ctrlKey && !event.altKey) {
        const target = event.target as HTMLElement | null;
        const isTyping =
          target?.tagName === "INPUT" ||
          target?.tagName === "TEXTAREA" ||
          target?.isContentEditable;
        if (!isTyping) {
          event.preventDefault();
          setOpen(true);
        }
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Command shouldFilter={false}>
        <CommandInput placeholder="Type a command or search..." autoFocus />
        <CommandList>
          <MedicationCommandList open={open} onSelect={openMedication} />
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
