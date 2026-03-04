import { useState } from "react"

import { DisplayedEpisodeDetailContext } from "../../contexts/DisplayedEpisodeDetailContext"
import { type ShowRecord } from "../../types/schemas"
import { type EpisodeSpecifierWithDisplayNumber } from "../../types/types"
import { titleSort } from "../../utils/showSort"
import { EpisodeDetailModal } from "./EpisodeDetailModal"
import { ShowDisplay } from "./ShowDisplay"

export function ShowDisplayList({ shows }: { shows: ShowRecord }) {
  // specifier for episode whose detail is to be displayed in a modal;
  // null for none
  const [displayedEpisodeDetailSpecifier, setDisplayedEpisodeDetailSpecifier] =
    useState<EpisodeSpecifierWithDisplayNumber | null>(null)

  return (
    <>
      {/* Context allows deep-nested elements to trigger or cancel display of an
          episode's detail in the modal below */}
      <DisplayedEpisodeDetailContext
        value={{
          setDisplayedEpisodeDetail: (specifier) =>
            setDisplayedEpisodeDetailSpecifier(specifier),
        }}
      >
        <ShowDisplayListBody shows={shows} />
      </DisplayedEpisodeDetailContext>

      <EpisodeDetailModal
        episodeDetailSpecifier={displayedEpisodeDetailSpecifier}
        shows={shows}
        close={() => setDisplayedEpisodeDetailSpecifier(null)}
      />
    </>
  )
}

export function ShowDisplayListBody({ shows }: { shows: ShowRecord }) {
  const showList = Object.values(shows)
  return (
    <div>
      {titleSort(showList).map((show) => (
        <ShowDisplay show={show} key={show.id} />
      ))}
    </div>
  )
}
