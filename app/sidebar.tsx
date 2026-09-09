"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { XIcon } from "lucide-react";

import { Kbd, KbdGroup } from "@/components/ui/kbd";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAddedMedications } from "./medications-provider";

export interface MedicationSidebarProps {
  active: boolean;
  onOpenDialog: (dialog: "add" | "search") => void;
}

export function MedicationSidebar({ active, onOpenDialog }: MedicationSidebarProps) {
  const { added, removeMedication } = useAddedMedications();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (!active) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable;
      if (isTyping) return;

      if (event.key === "a") {
        event.preventDefault();
        onOpenDialog("add");
        return;
      }

      if (event.key === "s") {
        event.preventDefault();
        onOpenDialog("search");
        return;
      }

      if (added.length === 0) return;

      if (event.key === "Enter") {
        const selected = added[selectedIndex] ?? added[0];
        if (selected) {
          event.preventDefault();
          router.push(`/${selected.slug}`);
        }
        return;
      }

      if (event.key === "j") {
        event.preventDefault();
        setSelectedIndex((index) => Math.min(index + 1, added.length - 1));
        return;
      }

      if (event.key === "k") {
        event.preventDefault();
        setSelectedIndex((index) => Math.max(index - 1, 0));
        return;
      }

      if (event.key === "x") {
        const selected = added[selectedIndex];
        if (selected) {
          event.preventDefault();
          removeMedication(selected.slug);
          setSelectedIndex((index) => Math.max(0, Math.min(index, added.length - 2)));
        }
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, added, selectedIndex, router, onOpenDialog, removeMedication]);

  return (
    <Sidebar collapsible="none">
      <SidebarHeader className="border-b border-sidebar-border">
        <span className="px-2 pt-1.5 text-sm font-medium text-sidebar-foreground">Medvim</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Medications</SidebarGroupLabel>
          <SidebarGroupContent>
            {added.length === 0 ? (
              <p className="px-2 py-1.5 text-xs text-sidebar-foreground/70">
                Press <Kbd>a</Kbd> to add a medication.
              </p>
            ) : (
              <SidebarMenu>
                {added.map((medication, index) => {
                  const selected = index === selectedIndex;
                  return (
                    <SidebarMenuItem key={medication.slug}>
                      <SidebarMenuButton
                        render={<Link href={`/${medication.slug}`} />}
                        isActive={selected}
                        aria-current={selected ? "true" : undefined}
                      >
                        <span>{medication.name}</span>
                      </SidebarMenuButton>
                      <SidebarMenuAction
                        aria-label={`Delete ${medication.name}`}
                        onClick={() => removeMedication(medication.slug)}
                      >
                        <XIcon />
                      </SidebarMenuAction>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-2 py-1.5 text-xs text-sidebar-foreground/70">
          <span className="inline-flex items-center gap-1">
            <Kbd>a</Kbd>
            <span>add</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <KbdGroup>
              <Kbd>j</Kbd>
              <Kbd>k</Kbd>
            </KbdGroup>
            <span>move</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <Kbd>Enter</Kbd>
            <span>open</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <Kbd>x</Kbd>
            <span>remove</span>
          </span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}