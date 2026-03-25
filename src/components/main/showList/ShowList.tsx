import { use, useState } from "react"

import { SelectedEpisodeContext } from "../../../contexts/SelectedEpisodeContext"
import { type ShowRecord } from "../../../types/schemas"
import { type EpisodeSpecifier } from "../../../types/types"
import { titleSort } from "../../../utils/showSort"
import { EpisodeDetailDialog } from "./episodeDetailDialog/EpisodeDetailDialog"
import { Show } from "./Show"

/**
 * Displays the main list of shows.
 * @param shows map (by id) of all the shows to display
 */
export function ShowList({ shows }: { shows: ShowRecord }) {
  // specifier for episode whose detail is to be displayed in a popup dialog;
  // undefined for none
  const [selectedEpisodeSpecifier, setSelectedEpisodeSpecifier] = useState<
    EpisodeSpecifier | undefined
  >(undefined)

  const specifier = selectedEpisodeSpecifier
  const episodeDescriptor = specifier
    ? shows[specifier.showId].seasons[specifier.seasonNum - 1][
        specifier?.episodeIdx
      ]
    : undefined

  return (
    <>
      {/* Context allows deep-nested elements to trigger or cancel display of an
          episode's detail in the popup dialog below */}
      <SelectedEpisodeContext
        value={{
          setSelectedEpisode: (specifier: EpisodeSpecifier | undefined) => {
            setSelectedEpisodeSpecifier(specifier)
          },
        }}
      >
        <ShowListBody
          shows={shows}
          selectedEpisode={selectedEpisodeSpecifier}
        />
      </SelectedEpisodeContext>

      <EpisodeDetailDialog
        episodeSpecifier={selectedEpisodeSpecifier}
        episodeDescriptor={episodeDescriptor}
        showTitle={specifier ? shows[specifier.showId].title : undefined}
        close={() => setSelectedEpisodeSpecifier(undefined)}
      />
    </>
  )
}

export function ShowListBody({
  shows,
  selectedEpisode,
}: {
  shows: ShowRecord
  selectedEpisode?: EpisodeSpecifier
}) {
  const { setSelectedEpisode } = use(SelectedEpisodeContext)
  const showList = Object.values(shows)
  return (
    <div onClick={() => setSelectedEpisode(undefined)}>
      {titleSort(showList).map((show) => (
        <Show show={show} selectedEpisode={selectedEpisode} key={show.id} />
      ))}
    </div>
  )
}
