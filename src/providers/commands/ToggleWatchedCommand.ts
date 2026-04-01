import { type QueryClient } from "@tanstack/react-query"
import { produce } from "immer"

import { toggleEpisodes } from "../../api/client"
import { type ShowRecord } from "../../types/schemas"
import { type PartialEpisodeSpecifier } from "../../types/types"
import { SHOWS_QUERY_KEY } from "../ShowsQueryProvider"
import { UndoableCommand } from "./command"
import { CommandError } from "./errors"

/**
 * Command to toggle the watched state of an episode
 */
export class ToggleWatchedCommand extends UndoableCommand {
  private queryClient: QueryClient
  private showId: string
  private showTitle: string
  private episodeSpecifiers: PartialEpisodeSpecifier[]

  constructor(
    queryClient: QueryClient,
    showId: string,
    showTitle: string,
    episodeSpecifiers: PartialEpisodeSpecifier[],
  ) {
    super()
    this.queryClient = queryClient
    this.showId = showId
    this.showTitle = showTitle
    this.episodeSpecifiers = episodeSpecifiers
  }

  isUndoable(): boolean {
    return true
  }

  /**
   * Sets the local state for the episode being updated
   * @param cachedData the query cache for all shows
   * @param newWatched is the episode being marked read (false for unread)
   */
  private updateLocalState(cachedData: ShowRecord) {
    const newData = produce(cachedData, (draft) => {
      for (const episodeSpecifier of this.episodeSpecifiers) {
        const watched = this.getWatchedStatus(draft, episodeSpecifier)
        this.setWatchedStatus(draft, episodeSpecifier, !watched)
      }
    })
    this.queryClient.setQueryData(SHOWS_QUERY_KEY, newData)
  }

  private getWatchedStatus(
    draft: ShowRecord, // actually an Immer proxy for ShowRecord
    episodeSpecifier: PartialEpisodeSpecifier,
  ) {
    return draft[this.showId].seasons[episodeSpecifier.seasonNum - 1][
      episodeSpecifier.episodeIdx
    ].watched
  }

  private setWatchedStatus(
    draft: ShowRecord, // actually an Immer proxy for ShowRecord
    episodeSpecifier: PartialEpisodeSpecifier,
    watched: boolean,
  ) {
    draft[this.showId].seasons[episodeSpecifier.seasonNum - 1][
      episodeSpecifier.episodeIdx
    ].watched = watched
  }

  /**
   * Execute the command
   */
  async execute() {
    const cachedData =
      this.queryClient.getQueryData<ShowRecord>(SHOWS_QUERY_KEY)
    if (!cachedData) {
      throw new CommandError(
        "Can't update episode watched status without cached show query results",
      )
    }

    // update local state optimistically
    this.updateLocalState(cachedData)

    try {
      await toggleEpisodes(this.showId, this.episodeSpecifiers)
    } catch (err) {
      console.error(err)

      // revert optimistic local state update
      await toggleEpisodes(this.showId, this.episodeSpecifiers)

      throw err
    }
  }

  /**
   * Undo the command
   */
  async undo() {
    // toggle is its own inverse operation
    this.execute()
  }

  undoDescription(): string {
    return `change watched status for ${this.episodeSpecifiers.length} episode${this.episodeSpecifiers.length > 1 ? "s" : ""} of ${this.showTitle}`
  }
}
