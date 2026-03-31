import * as AlertDialog from "@radix-ui/react-alert-dialog"
import * as Dialog from "@radix-ui/react-dialog"

export function ThemedAlertOverlay() {
  return <AlertDialog.Overlay className="fixed inset-0 bg-white/80" />
}

export function ThemedDialogOverlay() {
  return <Dialog.Overlay className="fixed inset-0 bg-white/80" />
}
