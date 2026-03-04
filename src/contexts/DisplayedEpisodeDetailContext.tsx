import { createContext } from "react"

import { type EpisodeSpecifierWithDisplayNumber } from "../types/types"

export interface DisplayedEpisodeDetailContextType {
  setDisplayedEpisodeDetail: (
    episodeSpecifier: EpisodeSpecifierWithDisplayNumber,
  ) => void
}

/**
 * Context allows deeply nested elements to control which episode, if any,
 * has its details displayed in a higher-up modal.
 */
export const DisplayedEpisodeDetailContext =
  createContext<DisplayedEpisodeDetailContextType>({
    setDisplayedEpisodeDetail: () => {},
  })
