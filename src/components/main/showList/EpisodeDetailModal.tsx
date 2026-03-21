import * as Dialog from "@radix-ui/react-dialog"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { ThreeDots } from "react-loader-spinner"

import { useCommandExecutor } from "../../../providers/commands/CommandExecutorProvider"
import { ToggleWatchedCommand } from "../../../providers/commands/ToggleWatchedCommand"
import { type EpisodeDescriptor } from "../../../types/schemas"
import { type EpisodeDetails } from "../../../types/schemas"
import { type EpisodeSpecifier } from "../../../types/types"
import {
  episodeDetailsCache,
  EpisodeMissingError,
} from "../../../utils/episodesDetailsCache"
import { errorToast } from "../../../utils/toasts"
import { EpisodeBox } from "./EpisodeBox"

const RELEASE_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
})

export function EpisodeDetailModal({
  episodeDetailSpecifier,
  episodeDescriptor,
  showTitle,
  close,
}: {
  episodeDetailSpecifier?: EpisodeSpecifier
  episodeDescriptor?: EpisodeDescriptor
  showTitle?: string
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
    episodeDetails && (
      <div>
        {/* Watched-status toggle control, show title and episode info; close button */}
        <Header
          showTitle={showTitle}
          episodeDetailSpecifier={episodeDetailSpecifier}
          episodeDescriptor={episodeDescriptor}
          episodeDetails={episodeDetails}
          close={close}
        />

        {/* Episode title */}
        <div className="text-2xl font-black">
          {episodeDetails.title ?? "Untitled"}
        </div>

        {/* Episode summary */}
        <div
          // eslint-disable-next-line react-dom/no-dangerously-set-innerhtml
          dangerouslySetInnerHTML={{
            __html:
              episodeDetails.summary?.replaceAll("<p>", '<p class="mb-2">') ||
              "No summary available",
          }}
        />
        {episodeDetails.release_date && (
          <div className="text-xs mt-2">
            Released:{" "}
            {RELEASE_DATE_FORMATTER.format(episodeDetails.release_date)}
          </div>
        )}
      </div>
    )
  )
}

function Header({
  showTitle,
  episodeDetailSpecifier,
  episodeDescriptor,
  episodeDetails,
  close,
}: {
  showTitle: string
  episodeDetailSpecifier: EpisodeSpecifier
  episodeDescriptor: EpisodeDescriptor
  episodeDetails: EpisodeDetails
  close: () => void
}) {
  return (
    <div className="flex justify-between">
      <div>
        <div className="flex items-start gap-2">
          {/* Big watched-status box, clickable to toggle */}
          <WatchedStatusToggle
            episodeDetailSpecifier={episodeDetailSpecifier}
            episodeDescriptor={episodeDescriptor}
          />

          <div>
            {/* Show title */}
            <div>
              <span className="font-bold">{showTitle}</span>
            </div>

            {/* Episode info */}
            <div className="text-sm">
              <span className="font-bold">
                Season {episodeDetailSpecifier.seasonNum},{" "}
                {episodeDescriptor.displayNumber === null
                  ? "special"
                  : `episode ${episodeDescriptor.displayNumber}`}
              </span>
              {episodeDetails.duration && (
                <span> ({episodeDetails.duration} min.)</span>
              )}
            </div>
          </div>
        </div>
      </div>
      <CloseButton close={close} />
    </div>
  )
}

/**
 * Toggle for watched/unwatched status of an episode. Displays as a larger
 * version of the episode box.
 */
function WatchedStatusToggle({
  episodeDescriptor,
  episodeDetailSpecifier,
}: {
  episodeDescriptor: EpisodeDescriptor
  episodeDetailSpecifier: EpisodeSpecifier
}) {
  const { executor } = useCommandExecutor()
  const queryClient = useQueryClient()

  return (
    <div
      onClick={async () => {
        try {
          await executor.execute(
            new ToggleWatchedCommand(queryClient, episodeDetailSpecifier),
          )
        } catch {
          errorToast(
            "An error occurred toggling episode watched status, try reloading",
          )
        }
      }}
    >
      <EpisodeBox
        episodeSpecifier={episodeDetailSpecifier}
        episodeDescriptor={episodeDescriptor}
        tailwindSize="12"
      />
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
