/**
 * Specifies an episode where the show is already known.
 */
export interface PartialEpisodeSpecifier {
  seasonNum: number
  episodeIdx: number
}

/**
 * Fully specifies an episode, including its show.
 */
export interface EpisodeSpecifier extends PartialEpisodeSpecifier {
  showId: string
}
