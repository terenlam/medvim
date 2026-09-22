"use client";

import { useEffect, useRef, useState } from "react";
import { useExtracted } from "next-intl";

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
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Link, useRouter } from "@/i18n/navigation";
import { isEditableTarget } from "@/lib/editable-target";
import { useAddedMedications } from "./medications-provider";
import { useGotoKeys } from "@/hooks/use-goto-keys";

export interface MedicationSidebarProps {
  active: boolean;
  onOpenDialog: (dialog: "add" | "search") => void;
}

const footerHints = [
  { keys: ["a"], id: "add" },
  { keys: ["j", "k"], id: "move" },
  { keys: ["gg"], id: "top" },
  { keys: ["G"], id: "bottom" },
  { keys: ["Enter"], id: "open" },
  { keys: ["x"], id: "remove" },
  { keys: ["Ctrl", "B"], id: "toggle" },
] as const;

type FooterHintId = (typeof footerHints)[number]["id"];

/**
 * Extracted labels, keyed by hint id.
 *
 * Messages must be string literals passed to `t` inside the function body that
 * created it, so the labels live here and the list above only looks them up.
 */
function useFooterHintLabels(): Record<FooterHintId, string> {
  const t = useExtracted();

  return {
    add: t({ message: "add", description: "Sidebar footer hint: add a medication" }),
    move: t({ message: "move", description: "Sidebar footer hint: move the selection" }),
    top: t({ message: "top", description: "Sidebar footer hint: jump to the first item" }),
    bottom: t({ message: "bottom", description: "Sidebar footer hint: jump to the last item" }),
    open: t({ message: "open", description: "Sidebar footer hint: open the selected medication" }),
    remove: t({ message: "remove", description: "Sidebar footer hint: remove the selected medication" }),
    toggle: t({ message: "toggle", description: "Sidebar footer hint: collapse or expand the sidebar" }),
  };
}

function FooterHint({ keys, label }: { keys: readonly string[]; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      {keys.length > 1 ? (
        <KbdGroup>
          {keys.map((key) => (
            <Kbd key={key}>{key}</Kbd>
          ))}
        </KbdGroup>
      ) : (
        <Kbd>{keys[0]}</Kbd>
      )}
      <span>{label}</span>
    </span>
  );
}

export function MedicationSidebar({ active, onOpenDialog }: MedicationSidebarProps) {
  const t = useExtracted();
  const footerHintLabels = useFooterHintLabels();
  const { added, removeMedication } = useAddedMedications();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const router = useRouter();

  const gotoKeyDown = useGotoKeys(active, (target) => {
    if (added.length === 0) return;
    setSelectedIndex(target === "top" ? 0 : added.length - 1);
  });

  useEffect(() => {
    itemRefs.current[selectedIndex]?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  useEffect(() => {
    if (!active) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      if (isEditableTarget(event.target)) return;

      if (gotoKeyDown(event)) return;

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
          router.push({ pathname: "/[slug]", params: { slug: selected.slug } });
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
  }, [active, added, selectedIndex, router, onOpenDialog, removeMedication, gotoKeyDown]);

  return (
    <Sidebar collapsible="none">
      <SidebarHeader className="border-b border-sidebar-border">
        <span className="px-2 pt-1.5 text-sm font-medium text-sidebar-foreground">Medvim</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t({ message: "Medications", description: "Heading of the medication group" })}</SidebarGroupLabel>
          <SidebarGroupContent>
            {added.length === 0 ? (
              <p className="px-2 py-1.5 text-xs text-sidebar-foreground/70">
                {t.rich({
                  message: "Press <kbd>a</kbd> to add a medication.",
                  description: "Shown in the sidebar when no medication has been added yet",
                  values: { kbd: (chunks) => <Kbd>{chunks}</Kbd> },
                })}
              </p>
            ) : (
              <SidebarMenu>
                {added.map((medication, index) => {
                  const selected = index === selectedIndex;
                  return (
                    <SidebarMenuItem
                      key={medication.slug}
                      ref={(el) => {
                        itemRefs.current[index] = el;
                      }}
                    >
                      <SidebarMenuButton
                        render={
                          <Link href={{ pathname: "/[slug]", params: { slug: medication.slug } }} />
                        }
                        isActive={selected}
                        aria-current={selected ? "true" : undefined}
                      >
                        <span>{medication.name}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <LanguageSwitcher />
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-2 py-1.5 text-xs text-sidebar-foreground/70">
          {footerHints.map(({ keys, id }) => (
            <FooterHint key={id} keys={keys} label={footerHintLabels[id]} />
          ))}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
