"use client";

import { useState } from "react";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AddMedicationCommand, CommandWithShortcuts } from "./command-box";
import { AddedMedicationsProvider } from "./medications-provider";
import { MedicationSidebar } from "./sidebar";

export type DialogKind = "add" | "search";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = useState<DialogKind | null>(null);

  return (
    <AddedMedicationsProvider>
      <SidebarProvider>
        <MedicationSidebar active={dialog === null} onOpenDialog={setDialog} />
        <div className="flex w-full min-w-0 flex-1 flex-col">{children}</div>
        <CommandWithShortcuts
          open={dialog === "search"}
          onOpenChange={(open) => setDialog(open ? "search" : null)}
        />
        <AddMedicationCommand
          open={dialog === "add"}
          onOpenChange={(open) => setDialog(open ? "add" : null)}
        />
      </SidebarProvider>
    </AddedMedicationsProvider>
  );
}