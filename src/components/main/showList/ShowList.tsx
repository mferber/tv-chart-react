import { useState } from "react"

import { DisplayedEpisodeDetailSpecifierContext } from "../../../contexts/DisplayedEpisodeDetailSpecifierContext"
import { type ShowRecord } from "../../../types/schemas"
import type { EpisodeSpecifier } from "../../../types/types"
import { titleSort } from "../../../utils/showSort"
import { EpisodeDetailModal } from "./EpisodeDetailModal"
import { Show } from "./Show"

/**
 * Displays the main list of shows.
 * @param shows map (by id) of all the shows to display
 */
export function ShowList({ shows }: { shows: ShowRecord }) {
  // specifier for episode whose detail is to be displayed in a popup dialog;
  // null for none
  const [displayedEpisodeDetailSpecifier, setDisplayedEpisodeDetailSpecifier] =
    useState<EpisodeSpecifier | null>(null)

  const specifier = displayedEpisodeDetailSpecifier
  const episodeDescriptor = specifier
    ? shows[specifier.showId].seasons[specifier.seasonNum - 1][
        specifier?.episodeIdx
      ]
    : null

  return (
    <>
      {/* Context allows deep-nested elements to trigger or cancel display of an
          episode's detail in the popup dialog below */}
      <DisplayedEpisodeDetailSpecifierContext
        value={{
          setDisplayedEpisodeDetailSpecifier: (specifier: EpisodeSpecifier) =>
            setDisplayedEpisodeDetailSpecifier(specifier),
        }}
      >
        <ShowListBody shows={shows} />
      </DisplayedEpisodeDetailSpecifierContext>

      <EpisodeDetailModal
        episodeDetailSpecifier={displayedEpisodeDetailSpecifier}
        episodeDescriptor={episodeDescriptor}
        showTitle={specifier ? shows[specifier.showId].title : null}
        close={() => setDisplayedEpisodeDetailSpecifier(null)}
      />
    </>
  )
}

export function ShowListBody({ shows }: { shows: ShowRecord }) {
  const showList = Object.values(shows)
  return (
    <div>
      {titleSort(showList).map((show) => (
        <Show show={show} key={show.id} />
      ))}
    </div>
  )
}
