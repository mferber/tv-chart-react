import { type QueryClient } from "@tanstack/react-query"

import { SHOWS_QUERY_KEY } from "../providers/ShowsQueryProvider"
import { type ShowRecord } from "../types/schemas"
import {
  type EpisodeSpecifier,
  type PartialEpisodeSpecifier,
} from "../types/types"

/**
 * Enumerates episodes of a show, up to and including the specified one, that have not
 * been watched. Supports the "Mark all watched up to here" feature.
 * @param episodeSpecifier the episode under consideration
 * @param queryClient
 * @returns an array of specifiers for the unwatched episodes
 */
export function findUnwatchedEpisodesUpTo(
  episodeSpecifier: EpisodeSpecifier,
  queryClient: QueryClient,
): PartialEpisodeSpecifier[] {
  const shows = queryClient.getQueryData<ShowRecord>(SHOWS_QUERY_KEY)
  if (!shows) {
    return []
  }
  const show = shows[episodeSpecifier.showId]
  if (!show) {
    return []
  }

  const unwatchedEpisodes = []

  // scan full seasons before the one containing this episode
  for (let s = 0; s < episodeSpecifier.seasonNum - 1; s++) {
    for (let eIdx = 0; eIdx < show.seasons[s].length; eIdx++) {
      const e = show.seasons[s][eIdx]
      if (!e.watched) {
        unwatchedEpisodes.push({
          seasonNum: s + 1,
          episodeIdx: eIdx,
        })
      }
    }
  }

  // scan the season containing this episode, up to and including this episode
  for (let eIdx = 0; eIdx <= episodeSpecifier.episodeIdx; eIdx++) {
    const e = show.seasons[episodeSpecifier.seasonNum - 1][eIdx]
    if (!e.watched) {
      unwatchedEpisodes.push({
        seasonNum: episodeSpecifier.seasonNum,
        episodeIdx: eIdx,
      })
    }
  }
  return unwatchedEpisodes
}
