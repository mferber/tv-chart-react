import * as Dialog from "@radix-ui/react-dialog"
import { useEffect, useState } from "react"
import { ThreeDots } from "react-loader-spinner"

import { type ShowRecord } from "../../../types/schemas"
import { type EpisodeDetails } from "../../../types/schemas"
import { type EpisodeSpecifierWithDisplayNumber } from "../../../types/types"
import {
  episodeDetailsCache,
  EpisodeMissingError,
} from "../../../utils/episodesDetailsCache"

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
    <Dialog.Root
      modal={false}
      open={episodeDetailSpecifier !== null}
      onOpenChange={close}
    >
      {episodeDetailSpecifier && (
        <Dialog.Content className="fixed h-1/3 right-8 bottom-8 left-8 p-4 border-4 rounded-xl bg-white outline-0 overflow-auto">
          <Dialog.Title className="sr-only" />
          <Dialog.Description className="sr-only" />
          <ModalBody
            episodeDetailSpecifier={episodeDetailSpecifier}
            shows={shows}
            close={close}
          />
        </Dialog.Content>
      )}
    </Dialog.Root>
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
            {episodeDetails.duration && (
              <div className="text-sm">{episodeDetails.duration} min.</div>
            )}
            <div className="text-2xl font-bold mt-2 mb-2">
              {episodeDetails.title ?? "Untitled"}
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
