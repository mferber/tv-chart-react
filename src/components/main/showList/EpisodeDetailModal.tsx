import * as Dialog from "@radix-ui/react-dialog"
import { useEffect, useState } from "react"
import { ThreeDots } from "react-loader-spinner"

import { type EpisodeDescriptor } from "../../../types/schemas"
import { type EpisodeDetails } from "../../../types/schemas"
import { type EpisodeSpecifier } from "../../../types/types"
import {
  episodeDetailsCache,
  EpisodeMissingError,
} from "../../../utils/episodesDetailsCache"

export function EpisodeDetailModal({
  episodeDetailSpecifier,
  episodeDescriptor,
  showTitle,
  close,
}: {
  episodeDetailSpecifier: EpisodeSpecifier | null
  episodeDescriptor: EpisodeDescriptor | null
  showTitle: string | null
  close: () => void
}) {
  return (
    <Dialog.Root
      modal={false}
      open={episodeDetailSpecifier !== null}
      onOpenChange={close}
    >
      {episodeDetailSpecifier && episodeDescriptor && showTitle && (
        <Dialog.Content className="fixed max-h-1/3 right-2 md:right-8 bottom-2 md:bottom-8 left-2 md:left-8 p-4 bg-gray-200 border-4 rounded-xl outline-0 overflow-auto">
          <Dialog.Title className="sr-only" />
          <Dialog.Description className="sr-only" />
          <ModalBody
            episodeDetailSpecifier={episodeDetailSpecifier}
            episodeDescriptor={episodeDescriptor}
            showTitle={showTitle}
            close={close}
          />
        </Dialog.Content>
      )}
    </Dialog.Root>
  )
}

function ModalBody({
  episodeDetailSpecifier,
  episodeDescriptor,
  showTitle,
  close,
}: {
  episodeDetailSpecifier: EpisodeSpecifier
  episodeDescriptor: EpisodeDescriptor
  showTitle: string
  close: () => void
}) {
  const [episodeDetails, setEpisodeDetails] = useState<EpisodeDetails | null>(
    episodeDetailsCache.getEpisodeDetails(episodeDetailSpecifier),
  )
  const [isLoading, setIsLoading] = useState(false)
  const [isEpisodeMissing, setIsEpisodeMissing] = useState(false)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    if (episodeDetails || isError) {
      return
    }

    const fetcher = async () => {
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
    }

    fetcher()
  }, [episodeDetailSpecifier, episodeDetails, isError])

  if (isError) {
    return (
      <div className="flex justify-between">
        <div>An error occurred loading episode information.</div>
        <CloseButton close={close} />
      </div>
    )
  }

  if (isEpisodeMissing) {
    return (
      <div className="flex justify-between">
        <div>No information available for this episode.</div>
        <CloseButton close={close} />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center w-full">
        <ThreeDots color="black" width="40" height="20" />
      </div>
    )
  }

  return (
    episodeDetails && (
      <ModalBodyContent
        episodeDetailSpecifier={episodeDetailSpecifier}
        episodeDescriptor={episodeDescriptor}
        episodeDetails={episodeDetails}
        showTitle={showTitle}
        close={close}
      />
    )
  )
}

function ModalBodyContent({
  episodeDetailSpecifier,
  episodeDescriptor,
  episodeDetails,
  showTitle,
  close,
}: {
  episodeDetailSpecifier: EpisodeSpecifier
  episodeDescriptor: EpisodeDescriptor
  episodeDetails: EpisodeDetails
  showTitle: string
  close: () => void
}) {
  return (
    <div>
      {episodeDetails && (
        <div className="flex justify-between">
          <div>
            <div>
              <input
                className="text-2xl mr-2"
                type="checkbox"
                name="watched"
                checked={episodeDescriptor.watched}
              />
              <span className="font-bold">{showTitle}</span>
            </div>
            <div className="text-sm">
              Season {episodeDetailSpecifier.seasonNum},{" "}
              {episodeDescriptor.displayNumber === null
                ? "special"
                : `episode ${episodeDescriptor.displayNumber}`}
              {episodeDetails.duration && (
                <span> ({episodeDetails.duration} min.)</span>
              )}
            </div>
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
          </div>
          <CloseButton close={close} />
        </div>
      )}
    </div>
  )
}

function CloseButton({ close }: { close: () => void }) {
  return (
    <div>
      <button type="button" onClick={close}>
        Close
      </button>
    </div>
  )
}
