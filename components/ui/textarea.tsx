import * as React from "react"

import { cn } from "@/lib/utils"
import { handleEditingShortcut } from "@/lib/edit-shortcuts"
import {
  EditingShortcutsDialog,
  useEditingShortcutsHelp,
} from "@/components/editing-shortcuts-dialog"

function Textarea({ className, onKeyDown, ...props }: React.ComponentProps<"textarea">) {
  const { helpOpen, setHelpOpen, handleHelpKeyDown } = useEditingShortcutsHelp()

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (handleHelpKeyDown(event)) {
      onKeyDown?.(event)
      return
    }
    handleEditingShortcut(event.currentTarget, event.nativeEvent)
    onKeyDown?.(event)
  }

  return (
    <>
    <textarea
      data-slot="textarea"
      onKeyDown={handleKeyDown}
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
      />
      <EditingShortcutsDialog open={helpOpen} onOpenChange={setHelpOpen} />
    </>
  )
}

export { Textarea }
