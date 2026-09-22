"use client";

import { useEffect, useRef, useState } from "react";

import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { isEditableTarget } from "@/lib/editable-target";
import { AddMedicationCommand, SearchMedicationCommand } from "./command-box";
import { AddedMedicationsProvider } from "./medications-provider";
import { MedicationSidebar } from "./sidebar";
import { useGotoKeys } from "@/hooks/use-goto-keys";

export type DialogKind = "add" | "search";

const SCROLL_STEP = 32;

export function AppShell({
  children,
  defaultOpen = true,
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <AddedMedicationsProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        <Shell>{children}</Shell>
      </SidebarProvider>
    </AddedMedicationsProvider>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  const { open } = useSidebar();
  const [dialog, setDialog] = useState<DialogKind | null>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  const gotoKeyDown = useGotoKeys(dialog === null && !open, (target) =>
    target === "top"
      ? window.scrollTo(0, 0)
      : window.scrollTo(0, document.documentElement.scrollHeight),
  );

  useEffect(() => {
    if (!open) {
      mainRef.current?.focus({ preventScroll: true });
    }
  }, [open]);

  useEffect(() => {
    if (dialog !== null || open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      if (isEditableTarget(event.target)) return;

      if (gotoKeyDown(event)) return;

      if (event.key === "a") {
        event.preventDefault();
        setDialog("add");
        return;
      }

      if (event.key === "s") {
        event.preventDefault();
        setDialog("search");
        return;
      }

      if (event.key === "j") {
        event.preventDefault();
        window.scrollBy(0, SCROLL_STEP);
        return;
      }

      if (event.key === "k") {
        event.preventDefault();
        window.scrollBy(0, -SCROLL_STEP);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dialog, open, gotoKeyDown]);

  return (
    <>
      <div
        data-testid="sidebar-wrapper"
        aria-hidden={!open}
        inert={!open}
        className={cn(
          "sticky top-0 self-start h-svh overflow-hidden transition-[width] duration-100 ease-linear",
          open ? "w-(--sidebar-width)" : "w-0",
        )}
      >
        <MedicationSidebar active={dialog === null && open} onOpenDialog={setDialog} />
      </div>
      <div
        data-testid="main-content"
        ref={mainRef}
        tabIndex={-1}
        className="flex w-full min-w-0 flex-1 flex-col outline-none"
      >
        {children}
      </div>
      <SearchMedicationCommand
        open={dialog === "search"}
        onOpenChange={(open) => setDialog(open ? "search" : null)}
      />
      <AddMedicationCommand
        open={dialog === "add"}
        onOpenChange={(open) => setDialog(open ? "add" : null)}
      />
    </>
  );
}
