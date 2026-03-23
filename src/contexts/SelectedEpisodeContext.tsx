import { createContext } from "react"

import type { EpisodeSpecifier } from "../types/types"

export interface SelectedEpisodeContextType {
  setSelectedEpisode: (episodeSpecifier: EpisodeSpecifier) => void
}

/**
 * Context allows deeply nested elements to control which episode, if any,
 * has its details displayed in a higher-up modal.
 */
export const SelectedEpisodeContext = createContext<SelectedEpisodeContextType>(
  {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setSelectedEpisode: (_: EpisodeSpecifier) => {},
  },
)
