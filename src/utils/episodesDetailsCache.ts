import { fetchEpisodes } from "../api/client"
import {
  type EpisodeDetails,
  episodeDetailsTableSchema,
} from "../types/schemas"
import type { EpisodeSpecifier } from "../types/types"

export class EpisodeMissingError extends Error {}

class EpisodeDetailsCache {
  cache: Map<string, EpisodeDetails[][]> = new Map()

  storeShowEpisodes(showId: string, episodeDetails: EpisodeDetails[][]) {
    this.cache.set(showId, episodeDetails)
  }

  getShowEpisodes(showId: string): EpisodeDetails[][] | undefined {
    return this.cache.get(showId)
  }

  // returns null if the show's metadata hasn't been cached yet
  // throws EpisodeMissingError if it has been cached but this episode is not found
  getEpisodeDetails(episodeSpecifier: EpisodeSpecifier): EpisodeDetails | null {
    const showEpisodes = this.getShowEpisodes(episodeSpecifier.showId)
    if (showEpisodes === undefined) {
      return null
    }
    const season = showEpisodes.at(episodeSpecifier.seasonNum - 1)
    if (season === undefined) {
      throw EpisodeMissingError
    }
    const episode = season.at(episodeSpecifier.episodeIdx)
    if (episode === undefined) {
      throw EpisodeMissingError
    }
    return episode
  }

  async fetchFor(showId: string): Promise<EpisodeDetails[][]> {
    console.log("Fetching for show", showId)

    const json = await fetchEpisodes(showId)
    const episodeDetails: EpisodeDetails[][] =
      episodeDetailsTableSchema.parse(json)
    this.storeShowEpisodes(showId, episodeDetails)
    return episodeDetails
  }
}

export const episodeDetailsCache = new EpisodeDetailsCache()
