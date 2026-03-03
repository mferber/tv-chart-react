import { useState } from "react"

import {
  DisplayedEpisodeDetailContext,
  type EpisodeSpecifier,
} from "../../contexts/DisplayedEpisodeDetailContext"
import { type Show, type ShowRecord } from "../../schemas/schemas"
import { EpisodeDetailModal } from "./EpisodeDetailModal"
import { ShowDisplay } from "./ShowDisplay"

// generates sortable version of show title
function titleSortKey(show: Show): string {
  return show.title.replace(/^(a|an|the) /i, "").toLowerCase()
}

// sorts shows using standard title sort
function titleSort(showList: Show[]): Show[] {
  const keyed_shows = showList.map((show) => ({
    show: show,
    key: titleSortKey(show),
  }))

  keyed_shows.sort((a, b) => a.key.localeCompare(b.key))
  return keyed_shows.map((ks) => ks.show)
}

export function ShowDisplayList({ shows }: { shows: ShowRecord }) {
  // specifier for episode whose detail is to be displayed in a modal;
  // null for none
  const [displayedEpisodeDetailSpecifier, setDisplayedEpisodeDetailSpecifier] =
    useState<EpisodeSpecifier | null>(null)

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
