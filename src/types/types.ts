import { type EpisodeDescriptor } from "./schemas"

/**
 * Specifies a given episode of a given show, by season and episode index.
 */
export interface EpisodeSpecifier {
  showId: string
  seasonNum: number
  episodeIdx: number
}

/**
 * Same as an EpisodeSpecifier, adding the display number of the episode, or null
 * for specials.
 */
export interface EpisodeSpecifierWithDisplayNumber extends EpisodeSpecifier {
  episodeDisplayNumber: number | null
}

/**
 * An EpisodeDescriptor (zod model), paired with the display number of the episode,
 * or null for specials.
 */
export class EpisodeWithDisplayNumber {
  episode: EpisodeDescriptor
  displayNum: number | null

  constructor(episode: EpisodeDescriptor, displayNum: number | null) {
    this.episode = episode
    this.displayNum = displayNum
  }

  /** Pair each episode with a display marker, marking special episodes with a
   * star and otherwise assigning consecutive numbers.
   */
  static fromEpisodeList(
    season: EpisodeDescriptor[],
  ): EpisodeWithDisplayNumber[] {
    const result: EpisodeWithDisplayNumber[] = []
    let nextEpisodeNumber = 1
    for (const episode of season) {
      let displayNum: number | null
      if (episode.type == "special") {
        displayNum = null
      } else {
        displayNum = nextEpisodeNumber++
      }
      result.push(new EpisodeWithDisplayNumber(episode, displayNum))
    }
    return result
  }
}
