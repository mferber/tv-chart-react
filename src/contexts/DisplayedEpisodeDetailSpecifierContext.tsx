import { createContext } from "react"

import type { EpisodeSpecifier } from "../types/types"

export interface DisplayedEpisodeDetailSpecifierContextType {
  setDisplayedEpisodeDetailSpecifier: (
    episodeSpecifier: EpisodeSpecifier,
  ) => void
}

/**
 * Context allows deeply nested elements to control which episode, if any,
 * has its details displayed in a higher-up modal.
 */
export const DisplayedEpisodeDetailSpecifierContext =
  createContext<DisplayedEpisodeDetailSpecifierContextType>({
    setDisplayedEpisodeDetailSpecifier: () => {},
  })
