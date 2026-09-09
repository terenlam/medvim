"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { defaultFilter, useCommandState } from "cmdk";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { medications } from "@/lib/medications/medications";

import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { useAddedMedications } from "./medications-provider";

const MAX_ITEMS = 5;

function MedicationCommandList({
  open,
  onSelect,
  excludeSlugs,
  emptyMessage,
}: {
  open: boolean;
  onSelect: (slug: string) => void;
  excludeSlugs?: ReadonlySet<string>;
  emptyMessage?: string;
}) {
  const search = useCommandState((state) => state.search);

  const visible = medications
    .filter(
      ({ name, slug }) => defaultFilter(name, search) > 0 && !excludeSlugs?.has(slug),
    )
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
      {visible.length === 0 && emptyMessage && <CommandEmpty>{emptyMessage}</CommandEmpty>}
      {visible.map((medication, index) => (
        <CommandItem
          key={medication.slug}
          value={medication.name}
          onSelect={() => onSelect(medication.slug)}
        >
          <span>{medication.name}</span>
          <CommandShortcut>
            <Kbd>Alt</Kbd> + <Kbd>{index + 1}</Kbd>
          </CommandShortcut>
        </CommandItem>
      ))}
    </CommandGroup>
  );
}

function FooterHints() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t px-2 py-1.5 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1">
        <KbdGroup>
          <Kbd>Ctrl</Kbd>
          <span>+</span>
          <Kbd>J</Kbd>
        </KbdGroup>
        <span>next</span>
      </span>
      <span className="inline-flex items-center gap-1">
        <KbdGroup>
          <Kbd>Ctrl</Kbd>
          <span>+</span>
          <Kbd>K</Kbd>
        </KbdGroup>
        <span>prev</span>
      </span>
      <span className="inline-flex items-center gap-1">
        <Kbd>Enter</Kbd>
        <span>select</span>
      </span>
    </div>
  );
}

export function CommandWithShortcuts({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();

  function openMedication(slug: string) {
    onOpenChange(false);
    router.push(`/${slug}`);
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command shouldFilter={false} loop>
        <CommandInput placeholder="Type a command or search..." autoFocus />
        <CommandList>
          <MedicationCommandList open={open} onSelect={openMedication} />
        </CommandList>
        <FooterHints />
      </Command>
    </CommandDialog>
  );
}

export function AddMedicationCommand({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { added, addMedication } = useAddedMedications();
  const [query, setQuery] = useState("");

  const excludeSlugs = useMemo(() => new Set(added.map(({ slug }) => slug)), [added]);

  function addMedicationBySlug(slug: string) {
    const medication = medications.find(({ slug: candidate }) => candidate === slug);
    if (medication) {
      addMedication(medication);
    }
    setQuery("");
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add Medication"
      description="Add a medication to your list."
    >
      <Command shouldFilter={false} loop>
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder="Type a medication name..."
          autoFocus
        />
        <CommandList>
          <MedicationCommandList
            open={open}
            onSelect={addMedicationBySlug}
            excludeSlugs={excludeSlugs}
            emptyMessage="No more medications to add."
          />
        </CommandList>
        <FooterHints />
      </Command>
    </CommandDialog>
  );
}