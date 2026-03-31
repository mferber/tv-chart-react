import * as AlertDialog from "@radix-ui/react-alert-dialog"
import type { ReactNode } from "react"

import { Button } from "./Button"
import { CustomAlertOverlay } from "./CustomDialogItems"

export function ThemedAlert({
  open,
  onOpenChange,
  trigger,
  triggerAsChild,
  body,
  cancelButtonText,
  actionButtonText,
  onAction,
}: {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: ReactNode
  triggerAsChild?: boolean
  body: ReactNode
  cancelButtonText?: string
  actionButtonText: string
  onAction: () => void | Promise<void>
}) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && (
        <AlertDialog.Trigger asChild={triggerAsChild}>
          {trigger}
        </AlertDialog.Trigger>
      )}
      <AlertDialog.Portal>
        <CustomAlertOverlay />
        <AlertDialog.Content className="fixed w-[90vw] max-w-120 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-stone-200 border p-6 rounded-lg shadow-gray-500 shadow-lg">
          <AlertDialog.Title className="sr-only" />
          <AlertDialog.Description className="sr-only" />
          {body}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <AlertDialog.Cancel asChild>
              <Button htmlType="button" buttonStyle="secondary">
                {cancelButtonText ?? "Cancel"}
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button htmlType="button" onClick={onAction}>
                {actionButtonText}
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
