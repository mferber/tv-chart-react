import { createContext } from "react"

export interface EpisodeSpecifier {
  show_id: string
  season_num: number
  episode_idx: number
}

export interface DisplayedEpisodeDetailContextType {
  setDisplayedEpisodeDetail: (episodeSpecifier: EpisodeSpecifier) => void
}

/**
 * Context allows deeply nested elements to control which episode, if any,
 * has its details displayed in a higher-up modal.
 */
export const DisplayedEpisodeDetailContext =
  createContext<DisplayedEpisodeDetailContextType>({
    setDisplayedEpisodeDetail: () => {},
  })
