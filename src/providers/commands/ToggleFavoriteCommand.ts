import type { QueryClient } from "@tanstack/react-query"
import { produce } from "immer"

import { toggleFavorite } from "../../api/client"
import type { ShowRecord } from "../../types/schemas"
import { SHOWS_QUERY_KEY } from "../ShowsQueryProvider"
import { UndoableCommand } from "./command"
import { CommandError } from "./errors"

export class ToggleShowFavoriteCommand extends UndoableCommand {
  showId: string
  showTitle: string
  queryClient: QueryClient

  constructor(showId: string, showTitle: string, queryClient: QueryClient) {
    super()
    this.showId = showId
    this.showTitle = showTitle
    this.queryClient = queryClient
  }

  async execute(): Promise<void> {
    const cachedData =
      this.queryClient.getQueryData<ShowRecord>(SHOWS_QUERY_KEY)
    if (!cachedData) {
      throw new CommandError(
        "Can't update episode watched status without cached show query results",
      )
    }

    // update local state optimistically
    const newData = produce(cachedData, (draft) => {
      draft[this.showId].favorite = !draft[this.showId].favorite
    })
    this.queryClient.setQueryData(SHOWS_QUERY_KEY, newData)
    try {
      await toggleFavorite(this.showId)
    } catch (err) {
      console.error(err)

      // revert optimistic update
      this.queryClient.setQueryData(SHOWS_QUERY_KEY, cachedData)
    }
  }

  async undo(): Promise<void> {
    // toggle is its own inverse
    this.execute()
  }

  undoDescription() {
    return `toggle favorite status for ${this.showTitle}`
  }
}
