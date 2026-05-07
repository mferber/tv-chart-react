import * as Dialog from "@radix-ui/react-dialog"
import { clsx } from "clsx"
import type { ReactNode } from "react"
import { twMerge } from "tailwind-merge"

import { ThemedDialogOverlay } from "./ThemedDialogItems"

export function ThemedDialog({
  open,
  onOpenChange,
  onOpenAutoFocus,
  modal,
  trigger,
  triggerAsChild,
  contentClassName,
  body,
}: {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onOpenAutoFocus?: Dialog.DialogContentProps["onOpenAutoFocus"]
  modal?: boolean
  trigger?: ReactNode
  triggerAsChild?: boolean
  contentClassName?: string
  body: ReactNode
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} modal={modal}>
      {trigger && (
        <Dialog.Trigger asChild={triggerAsChild}>{trigger}</Dialog.Trigger>
      )}
      <Dialog.Portal>
        <ThemedDialogOverlay />
        <Dialog.Content
          onOpenAutoFocus={onOpenAutoFocus}
          className={twMerge(
            clsx(
              "bg-stone-200 border p-6 rounded-lg shadow-gray-500 shadow-lg overflow-auto focus-visible:outline-none",
              contentClassName,
            ),
          )}
        >
          <Dialog.Title className="sr-only" />
          <Dialog.Description className="sr-only" />
          {body}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
