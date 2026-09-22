"use client";

import { useEffect, useMemo, useState } from "react";
import { useExtracted } from "next-intl";
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
import { useRouter } from "@/i18n/navigation";
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
  const t = useExtracted();
  const search = useCommandState((state) => state.search);

  const visible = medications
    .filter(({ name, slug }) => defaultFilter(name, search) > 0 && !excludeSlugs?.has(slug))
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
    <CommandGroup heading={t({ message: "Medications", description: "Heading of the medication group" })}>
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
  const t = useExtracted();

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t px-2 py-1.5 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1">
        <KbdGroup>
          <Kbd>Ctrl</Kbd>
          <span>+</span>
          <Kbd>J</Kbd>
        </KbdGroup>
        <span>{t({ message: "next", description: "Footer hint: go to the next suggestion" })}</span>
      </span>
      <span className="inline-flex items-center gap-1">
        <KbdGroup>
          <Kbd>Ctrl</Kbd>
          <span>+</span>
          <Kbd>K</Kbd>
        </KbdGroup>
        <span>{t({ message: "prev", description: "Footer hint: go to the previous suggestion" })}</span>
      </span>
      <span className="inline-flex items-center gap-1">
        <KbdGroup>
          <Kbd>Ctrl</Kbd>
          <span>+</span>
          <Kbd>/</Kbd>
        </KbdGroup>
        <span>{t({ message: "shortcuts", description: "Footer hint: open the editing shortcuts help" })}</span>
      </span>
      <span className="inline-flex items-center gap-1">
        <Kbd>Enter</Kbd>
        <span>{t({ message: "select", description: "Footer hint: open the highlighted suggestion" })}</span>
      </span>
    </div>
  );
}

export function SearchMedicationCommand({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useExtracted();
  const router = useRouter();

  function openMedication(slug: string) {
    onOpenChange(false);
    router.push({ pathname: "/[slug]", params: { slug } });
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t({ message: "Search medications", description: "Title of the medication search dialog" })}
      description={t({ message: "Find a medication to open.", description: "Subtitle of the medication search dialog" })}
    >
      <Command shouldFilter={false} loop>
        <CommandInput
          placeholder={t({ message: "Type a command or search...", description: "Placeholder of the search input" })}
          autoFocus
        />
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
  const t = useExtracted();
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
      title={t({ message: "Add Medication", description: "Title of the add-medication dialog" })}
      description={t({ message: "Add a medication to your list.", description: "Subtitle of the add-medication dialog" })}
    >
      <Command shouldFilter={false} loop>
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder={t({ message: "Type a medication name...", description: "Placeholder of the medication name input" })}
          autoFocus
        />
        <CommandList>
          <MedicationCommandList
            open={open}
            onSelect={addMedicationBySlug}
            excludeSlugs={excludeSlugs}
            emptyMessage={t({ message: "No more medications to add.", description: "Shown when every medication is already on the list" })}
          />
        </CommandList>
        <FooterHints />
      </Command>
    </CommandDialog>
  );
}
