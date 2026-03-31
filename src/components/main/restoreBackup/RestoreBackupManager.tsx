import * as AlertDialog from "@radix-ui/react-alert-dialog"
import * as Dialog from "@radix-ui/react-dialog"
import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

import { HttpBadRequestError, uploadImportFile } from "../../../api/client"
import { SHOWS_QUERY_KEY } from "../../../providers/ShowsQueryProvider"
import { errorToast, infoToast } from "../../../utils/toasts"
import { Button } from "../../misc/Button"
import {
  CustomAlertOverlay,
  CustomDialogOverlay,
} from "../../misc/CustomDialogItems"

export function RestoreBackupManager({
  open,
  setOpen,
}: {
  open: boolean
  setOpen: (open: boolean) => void
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [confirmationIsOpen, setConfirmationIsOpen] = useState(false)
  const queryClient = useQueryClient()

  async function uploadSelectedFile() {
    if (selectedFile === null) {
      return
    }

    setIsLoading(true)

    try {
      queryClient.setQueryData(SHOWS_QUERY_KEY, [])
      await uploadImportFile(selectedFile)
      infoToast("Show listings imported")
    } catch (e) {
      if (e instanceof HttpBadRequestError) {
        errorToast("Uploaded file is invalid. No changes have been made.")
      } else {
        errorToast(
          "Unknown error occurred trying to restore from backup. No changes have been made.",
        )
      }
      setIsLoading(false)
      return
    } finally {
      queryClient.invalidateQueries({ queryKey: SHOWS_QUERY_KEY })
      setIsLoading(false)
    }
  }

  return (
    <>
      <UploadBackupFileModal
        open={open}
        onOpenChange={setOpen}
        setConfirmationIsOpen={(open) => setConfirmationIsOpen(open)}
        selectedFile={selectedFile}
        setSelectedFile={(file) => setSelectedFile(file)}
        isLoading={isLoading}
      />
      {selectedFile && (
        <UploadBackupConfirmationAlert
          selectedFile={selectedFile}
          open={confirmationIsOpen}
          onOpenChange={setConfirmationIsOpen}
          uploadSelectedFile={uploadSelectedFile}
          closeBackupManager={() => setOpen(false)}
        />
      )}
    </>
  )
}

function UploadBackupFileModal({
  open,
  onOpenChange,
  selectedFile,
  setSelectedFile,
  setConfirmationIsOpen,
  isLoading,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedFile: File | null
  setSelectedFile: (file: File | null) => void
  setConfirmationIsOpen: (open: boolean) => void
  isLoading: boolean
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <CustomDialogOverlay />
        <Dialog.Content className="w-5/6 max-w-100 sm:w-auto sm:min-w-100 sm:max-w-5/6 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 border-4 rounded-xl bg-white overflow-auto">
          <Dialog.Title className="sr-only" />
          <Dialog.Description className="sr-only" />
          <div className="flex justify-end">
            <button
              type="button"
              className="text-right mb-2"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </button>
          </div>
          <div className="mb-2">Select a backup file to upload.</div>
          <div className="font-bold mb-4">
            Restoring from a backup will replace all your current show listings.
            This operation cannot be undone.
          </div>
          <input
            type="file"
            name="upload"
            className="file:rounded-md file:bg-red-800 file:text-white file:py-1 file:px-4 bg-stone-200 w-full mb-4"
            onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
          />
          <div>
            <Button
              htmlType="button"
              disabled={selectedFile == null}
              spinner={isLoading}
              onClick={() => setConfirmationIsOpen(true)}
            >
              Continue
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function UploadBackupConfirmationAlert({
  open,
  onOpenChange,
  selectedFile,
  uploadSelectedFile,
  closeBackupManager,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedFile: File
  uploadSelectedFile: (file: File) => Promise<void>
  closeBackupManager: () => void
}) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <CustomAlertOverlay />
        <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 border-4 rounded-xl bg-white outline-0 overflow-auto">
          <AlertDialog.Title className="sr-only" />
          <AlertDialog.Description className="sr-only" />
          <div>
            Are you sure you want to overwrite your current show listings with
            the contents of {selectedFile.name}?
          </div>
          <div className="flex justify-end gap-4">
            <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
            <AlertDialog.Action
              onClick={async () => {
                await uploadSelectedFile(selectedFile)
                closeBackupManager()
              }}
            >
              Overwrite
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
