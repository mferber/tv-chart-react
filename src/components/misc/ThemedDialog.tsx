import * as Dialog from "@radix-ui/react-dialog"
import type { ReactNode } from "react"

import { ThemedDialogOverlay } from "./ThemedDialogItems"

export function ThemedDialog({
  open,
  onOpenChange,
  modal,
  trigger,
  triggerAsChild,
  body,
}: {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  modal?: boolean
  trigger?: ReactNode
  triggerAsChild?: boolean
  body: ReactNode
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} modal={modal}>
      {trigger && (
        <Dialog.Trigger asChild={triggerAsChild}>{trigger}</Dialog.Trigger>
      )}
      <Dialog.Portal>
        <ThemedDialogOverlay />
        <Dialog.Content className="w-5/6 max-w-100 sm:w-auto sm:min-w-100 sm:max-w-5/6 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-stone-200 border p-6 rounded-lg shadow-gray-500 shadow-lg">
          <Dialog.Title className="sr-only" />
          <Dialog.Description className="sr-only" />
          {body}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
