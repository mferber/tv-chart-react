import { useQueryClient } from "@tanstack/react-query"
import React, { type ReactNode, useState } from "react"

import { useCommandExecutor } from "../../../providers/commands/CommandExecutorProvider"
import {
  UpdateUserFieldsCommand,
  type UpdateUserFieldsValues,
} from "../../../providers/commands/UpdateUserFieldsCommand"
import { type Show } from "../../../types/schemas"
import { ThemedButton } from "../../misc/ThemedButton"
import { ThemedDialog } from "../../misc/ThemedDialog"

export function EditUserFieldsDialog({
  trigger,
  show,
  initialValues,
}: {
  trigger: ReactNode
  show: Show
  initialValues: UpdateUserFieldsValues
}) {
  const [open, setOpen] = useState(false)

  return (
    <ThemedDialog
      open={open}
      onOpenChange={setOpen}
      trigger={trigger}
      contentClassName="w-5/6 max-w-100 sm:w-auto sm:min-w-100 sm:max-w-5/6 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      body={
        <EditUserFieldsDialogBody
          show={show}
          initialValues={initialValues}
          close={() => setOpen(false)}
        />
      }
    />
  )
}

function EditUserFieldsDialogBody({
  show,
  initialValues,
  close,
}: {
  show: Show
  initialValues: UpdateUserFieldsValues
  close: () => void
}) {
  const { executor } = useCommandExecutor()
  const queryClient = useQueryClient()

  const [values, setValues] = useState({
    channel:
      initialValues.channel !== null &&
      initialValues.channel !== "" &&
      !channels.includes(initialValues.channel)
        ? "Other"
        : initialValues.channel || "",
    channel_other:
      initialValues.channel !== null &&
      initialValues.channel !== "" &&
      !channels.includes(initialValues.channel)
        ? initialValues.channel
        : "",
    notes: initialValues.notes,
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  // submit the dialog if the user presses Enter/Return
  const handleNotesKeyDown = (
    e: React.KeyboardEvent<HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    if (
      e.key === "Enter" &&
      !(e.shiftKey || e.altKey || e.metaKey || e.ctrlKey)
    ) {
      saveUpdate()
    }
  }

  const saveUpdate = async () => {
    setIsSaving(true)

    const saveValues = {
      channel:
        values.channel == "Other" ? values.channel_other : values.channel,
      notes: values.notes,
    }
    await executor.execute(
      new UpdateUserFieldsCommand(queryClient, show, saveValues),
    )

    setIsSaving(false)
    close()
  }

  return (
    <form>
      <div>
        <label htmlFor="channel">
          <div className="font-bold">Where to watch:</div>
          <div className="text-sm">(select Other to add your own)</div>
        </label>
      </div>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <select
          id="channel"
          name="channel"
          className="bg-white border"
          value={
            channels.includes(values.channel) || values.channel === ""
              ? values.channel
              : "Other"
          }
          onChange={handleChange}
          onKeyDown={handleNotesKeyDown}
        >
          <option value="" key="(none)">
            Make a selection
          </option>
          {channels.map((channel) => (
            <option key={channel}>{channel}</option>
          ))}
          <option key="Other">Other</option>
        </select>

        <input
          type="text"
          name="channel_other"
          value={values.channel_other}
          className={"bg-white border p-1 disabled:opacity-20"}
          disabled={values.channel !== "Other"}
          onChange={handleChange}
        />
      </div>

      <section className="mt-4 font-bold">Notes:</section>
      <textarea
        name="notes"
        className="bg-white border p-1 w-full"
        rows={4}
        defaultValue={values.notes || undefined}
        onChange={handleChange}
        onKeyDown={handleNotesKeyDown}
      ></textarea>
      <div className="flex gap-2 justify-end mt-4">
        <ThemedButton
          htmlType="button"
          buttonStyle="secondary"
          onClick={() => close()}
        >
          Cancel
        </ThemedButton>
        <ThemedButton
          htmlType="button"
          buttonStyle="primary"
          spinner={isSaving}
          onClick={() => saveUpdate()}
        >
          Save changes
        </ThemedButton>
      </div>
    </form>
  )
}

const channels = [
  "A&E",
  "ABC",
  "Amazon Prime Video",
  "AMC",
  "Apple TV",
  "BBC America",
  "BET",
  "Bravo",
  "Cartoon Network",
  "CBS",
  "Comedy Central",
  "CW",
  "Disney+",
  "Disney Channel",
  "DVD/Blu-Ray",
  "E!",
  "ESPN",
  "ESPN2",
  "ESPN Unlimited",
  "Food Network",
  "Fox",
  "Freeform",
  "Fubo",
  "FX",
  "FXX",
  "Hallmark Channel",
  "HBO",
  "HBO Max",
  "HGTV",
  "History Channel",
  "Hulu",
  "Lifetime",
  "NBC",
  "Netflix",
  "Nickelodeon",
  "Oxygen",
  "Paramount+",
  "Paramount Network",
  "PBS",
  "Peacock",
  "Showtime",
  "Sling TV",
  "Starz",
  "Syfy",
  "TBS",
  "TNT",
  "Travel Channel",
  "truTV",
  "USA Network",
  "YouTube",
  "YouTube TV",
]
