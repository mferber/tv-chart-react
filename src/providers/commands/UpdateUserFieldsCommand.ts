import { type QueryClient } from "@tanstack/react-query"
import { produce } from "immer"

import { updateUserFields } from "../../api/client"
import { type Show, type ShowRecord } from "../../types/schemas"
import { SHOWS_QUERY_KEY } from "../ShowsQueryProvider"
import { UndoableCommand } from "./command"
import { CommandError } from "./errors"

export interface UpdateUserFieldsValues {
  channel: string | null
  notes: string | null
}

export class UpdateUserFieldsCommand extends UndoableCommand {
  newValues: UpdateUserFieldsValues
  show: Show
  queryClient: QueryClient
  origValues: UpdateUserFieldsValues | null = null

  constructor(
    queryClient: QueryClient,
    show: Show,
    newValues: UpdateUserFieldsValues,
  ) {
    super()
    this.queryClient = queryClient
    this.show = show
    this.newValues = newValues
  }

  private async updateFields(toValues: UpdateUserFieldsValues) {
    const cachedData =
      this.queryClient.getQueryData<ShowRecord>(SHOWS_QUERY_KEY)
    if (!cachedData) {
      throw new CommandError(
        "Can't update episode watched status without cached show query results",
      )
    }

    this.origValues = {
      channel: this.show.user_channel || null,
      notes: this.show.user_notes || null,
    }

    // optimistic state update
    const newData = produce(cachedData, (draft) => {
      draft[this.show.id].user_channel = toValues.channel
      draft[this.show.id].user_notes = toValues.notes
    })
    this.queryClient.setQueryData<ShowRecord>(SHOWS_QUERY_KEY, newData)

    try {
      await updateUserFields(this.show.id, toValues)
    } catch (err) {
      console.error(err)

      // revert optimistic state update
      this.queryClient.setQueryData<ShowRecord>(SHOWS_QUERY_KEY, cachedData)
    }
  }

  async execute(): Promise<void> {
    await this.updateFields(this.newValues)
  }

  async undo(): Promise<void> {
    if (!this.origValues) {
      return
    }
    await this.updateFields(this.origValues)
  }

  undoDescription(): string | null {
    return "Update notes on " + this.show.title
  }
}
