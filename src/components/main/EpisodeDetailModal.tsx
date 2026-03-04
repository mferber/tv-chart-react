import { useEffect, useState } from "react"
import { ThreeDots } from "react-loader-spinner"
import Modal from "react-modal"

import { type ShowRecord } from "../../types/schemas"
import { type EpisodeDetails } from "../../types/schemas"
import { type EpisodeSpecifierWithDisplayNumber } from "../../types/types"
import {
  episodeDetailsCache,
  EpisodeMissingError,
} from "../../utils/episodesDetailsCache"

export function EpisodeDetailModal({
  episodeDetailSpecifier,
  shows,
  close,
}: {
  episodeDetailSpecifier: EpisodeSpecifierWithDisplayNumber | null
  shows: ShowRecord
  close: () => void
}) {
  return (
    <Modal isOpen={episodeDetailSpecifier !== null}>
      {episodeDetailSpecifier && (
        <ModalBody
          episodeDetailSpecifier={episodeDetailSpecifier}
          shows={shows}
          close={close}
        />
      )}
    </Modal>
  )
}

function ModalBody({
  episodeDetailSpecifier,
  shows,
  close,
}: {
  episodeDetailSpecifier: EpisodeSpecifierWithDisplayNumber
  shows: ShowRecord
  close: () => void
}) {
  const [episodeDetails, setEpisodeDetails] = useState<EpisodeDetails | null>(
    episodeDetailsCache.getEpisodeDetails(episodeDetailSpecifier),
  )
  const [isLoading, setIsLoading] = useState(false)
  const [isEpisodeMissing, setIsEpisodeMissing] = useState(false)
  const [isError, setIsError] = useState(false)

  function isWatched(
    shows: ShowRecord,
    episodeDetailSpecifier: EpisodeSpecifierWithDisplayNumber,
  ): boolean {
    const show = shows[episodeDetailSpecifier.showId]
    const seasonIdx = episodeDetailSpecifier.seasonNum - 1
    const episodeIdx = episodeDetailSpecifier.episodeIdx

    return show.seasons[seasonIdx][episodeIdx].watched
  }

  useEffect(() => {
    if (episodeDetails || isError) {
      return
    }

    ;(async () => {
      setIsLoading(true)
      let fetchedEpisodes: EpisodeDetails[][] | null = null
      try {
        fetchedEpisodes = await episodeDetailsCache.fetchFor(
          episodeDetailSpecifier.showId,
        )
      } catch (e) {
        if (e instanceof EpisodeMissingError) {
          setIsEpisodeMissing(true)
        }
        setIsLoading(false)
        setIsError(true)
        console.error(e)
        return
      }
      setIsLoading(false)
      setEpisodeDetails(
        fetchedEpisodes[episodeDetailSpecifier.seasonNum - 1][
          episodeDetailSpecifier.episodeIdx
        ],
      )
    })()
  }, [episodeDetailSpecifier, episodeDetails, isError])

  return (
    <div>
      <div className="text-right">
        <button type="button" onClick={close}>
          Cancel
        </button>
      </div>
      <div>
        {isLoading && (
          <div className="flex justify-center w-full">
            <ThreeDots color="black" width="40" height="20" />
          </div>
        )}

        {isError && <div>⚠️ Error</div>}

        {isEpisodeMissing && (
          <div>No information available for this episode</div>
        )}

        {episodeDetails && (
          <>
            <div className="text-xs">
              {isWatched(shows, episodeDetailSpecifier)
                ? "*WATCHED*"
                : "unwatched"}
            </div>
            <div className="font-bold">
              {shows[episodeDetailSpecifier.showId].title}
            </div>
            <div className="text-sm">
              Season {episodeDetailSpecifier.seasonNum},{" "}
              {episodeDetailSpecifier.episodeDisplayNumber === null
                ? "special"
                : `episode ${episodeDetailSpecifier.episodeDisplayNumber}`}
            </div>
            <div className="text-2xl font-bold mt-2 mb-2">
              {episodeDetails.title}
            </div>
            <div
              // eslint-disable-next-line react-dom/no-dangerously-set-innerhtml
              dangerouslySetInnerHTML={{
                __html:
                  episodeDetails.summary?.replaceAll(
                    "<p>",
                    '<p class="mb-2">',
                  ) || "No summary available",
              }}
            />
          </>
        )}
      </div>
    </div>
  )
}
