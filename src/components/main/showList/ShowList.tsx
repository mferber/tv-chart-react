import { use, useEffect, useState } from "react"

import { SelectedEpisodeContext } from "../../../contexts/SelectedEpisodeContext"
import { useUserPrefs } from "../../../providers/UserPrefsProvider"
import { type Show, type ShowRecord } from "../../../types/schemas"
import { type EpisodeSpecifier } from "../../../types/types"
import { titleSort } from "../../../utils/showSort"
import { EpisodeDetailDialog } from "./episodeDetailDialog/EpisodeDetailDialog"
import { Show as ShowComponent } from "./Show"

const LAYOUT_CATCHUP_DELAY = 300

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

  // bottom padding allows the window to scroll further than normal when the episode
  // details dialog is showing, so that content at the bottom of the page won't be
  // obscured by the dialog
  const [episodeDetailsBounds, setEpisodeDetailsBounds] =
    useState<DOMRect | null>(null)

  const specifier = selectedEpisodeSpecifier
  const episodeDescriptor = specifier
    ? shows[specifier.showId].seasons[specifier.seasonNum - 1][
        specifier?.episodeIdx
      ]
    : undefined

  // pad enough to account for the episode details dialog and its bottom margin
  const bottomPaddingPx = episodeDetailsBounds
    ? episodeDetailsBounds.height +
      (window.innerHeight - episodeDetailsBounds.bottom)
    : 0

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
          bottomPaddingPx={bottomPaddingPx}
        />
      </SelectedEpisodeContext>

      <EpisodeDetailDialog
        episodeSpecifier={selectedEpisodeSpecifier}
        episodeDescriptor={episodeDescriptor}
        showTitle={specifier ? shows[specifier.showId].title : undefined}
        onBoundsFinalized={(h) => setEpisodeDetailsBounds(h)}
        close={() => setSelectedEpisodeSpecifier(undefined)}
      />
    </>
  )
}

export function ShowListBody({
  shows,
  selectedEpisode,
  bottomPaddingPx,
}: {
  shows: ShowRecord
  selectedEpisode?: EpisodeSpecifier
  bottomPaddingPx: number
}) {
  const { setSelectedEpisode } = use(SelectedEpisodeContext)
  const { userPrefs } = useUserPrefs()

  // If the selected episode box is hidden behind the episode details, scroll it
  // into view
  useEffect(() => {
    const maybeScrollSelectedEpisodeIntoView = () => {
      const selectedEpisodeBox = document.getElementById("selected-episode-box")
      if (!selectedEpisodeBox || bottomPaddingPx === 0) {
        return
      }

      const selectedRect = selectedEpisodeBox.getBoundingClientRect()
      const visibleBottom = window.innerHeight - bottomPaddingPx

      const hiddenByPixels = selectedRect.bottom - visibleBottom
      if (hiddenByPixels > 0) {
        window.scrollTo({
          top: window.scrollY + hiddenByPixels + selectedRect.height,
          behavior: "smooth",
        })
      }
    }

    let scrollAfterLayoutTimeout: number | null = null
    if (scrollAfterLayoutTimeout !== null) {
      window.clearTimeout(scrollAfterLayoutTimeout)
    }

    // Leave a little time for layout to catch up before doing the actual scroll,
    // otherwise sometimes it doesn't scroll the right amount
    scrollAfterLayoutTimeout = window.setTimeout(() => {
      maybeScrollSelectedEpisodeIntoView()
    }, LAYOUT_CATCHUP_DELAY)
  }, [selectedEpisode, bottomPaddingPx])

  const showFilter: (s: Show) => boolean = (show) => {
    const favoritesFilterIsOn = userPrefs?.show_favorites_only || false
    if (favoritesFilterIsOn) {
      return show.favorite
    } else {
      return true
    }
  }

  const showList = Object.values(shows)
  return (
    <div
      className="transition-[padding-bottom] duration-200 ease-out"
      onClick={() => setSelectedEpisode(undefined)}
      style={{ paddingBottom: `${selectedEpisode ? bottomPaddingPx : 0}px` }}
    >
      {titleSort(showList)
        .filter(showFilter)
        .map((show) => (
          <ShowComponent
            show={show}
            selectedEpisode={selectedEpisode}
            key={show.id}
          />
        ))}
    </div>
  )
}
