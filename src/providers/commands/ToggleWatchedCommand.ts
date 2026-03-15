import type { QueryClient } from "@tanstack/react-query"
import { produce } from "immer"

import { toggleEpisodes } from "../../api/client"
import type { ShowRecord } from "../../types/schemas"
import type { EpisodeSpecifier } from "../../types/types"
import { SHOWS_QUERY_KEY } from "../ShowsQueryProvider"
import { CommandError } from "./errors"

/**
 * Command to toggle the watched state of an episode
 */
export class ToggleWatchedCommand {
  private queryClient: QueryClient
  private episodeSpecifier: EpisodeSpecifier

  constructor(queryClient: QueryClient, episodeSpecifier: EpisodeSpecifier) {
    this.queryClient = queryClient
    this.episodeSpecifier = episodeSpecifier
  }

  /**
   * Sets the local state for the episode being updated
   * @param cachedData the query cache for all shows
   * @param newWatched is the episode being marked read (false for unread)
   */
  private async updateLocalState(cachedData: ShowRecord, newWatched: boolean) {
    const newData = produce(cachedData, (draft) => {
      draft[this.episodeSpecifier.showId].seasons[
        this.episodeSpecifier.seasonNum - 1
      ][this.episodeSpecifier.episodeIdx].watched = newWatched
    })
    this.queryClient.setQueryData(SHOWS_QUERY_KEY, newData)
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

    const currentlyWatched =
      cachedData[this.episodeSpecifier.showId].seasons[
        this.episodeSpecifier.seasonNum - 1
      ][this.episodeSpecifier.episodeIdx].watched

    // update local state optimistically
    this.updateLocalState(cachedData, !currentlyWatched)

    try {
      await toggleEpisodes(this.episodeSpecifier.showId, [
        this.episodeSpecifier,
      ])
    } catch (err) {
      console.error(err)

      // revert optimistic local state update
      await toggleEpisodes(this.episodeSpecifier.showId, [
        this.episodeSpecifier,
      ])

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
}
