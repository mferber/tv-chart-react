/**
 * Specifies a given episode of a given show, by season and episode index.
 */
export interface EpisodeSpecifier {
  showId: string
  seasonNum: number
  episodeIdx: number
}
