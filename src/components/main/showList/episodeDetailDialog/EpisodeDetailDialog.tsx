import * as Dialog from "@radix-ui/react-dialog"
import { useEffect, useState } from "react"
import { ThreeDots } from "react-loader-spinner"

import { type EpisodeDescriptor } from "../../../../types/schemas"
import { type EpisodeDetails } from "../../../../types/schemas"
import { type EpisodeSpecifier } from "../../../../types/types"
import {
  episodeDetailsCache,
  EpisodeMissingError,
} from "../../../../utils/episodesDetailsCache"
import { EpisodeDetailDialogCloseButton } from "./EpisodeDetailDialogCloseButton"
import { ModalBodyContent } from "./EpisodeDetailDialogContent"

export function EpisodeDetailDialog({
  episodeSpecifier,
  episodeDescriptor,
  showTitle,
  close,
}: {
  episodeSpecifier?: EpisodeSpecifier
  episodeDescriptor?: EpisodeDescriptor
  showTitle?: string
  close: () => void
}) {
  return (
    <Dialog.Root modal={false} open={episodeSpecifier !== null}>
      {episodeSpecifier && episodeDescriptor && showTitle && (
        <Dialog.Content className="fixed max-h-2/5 right-2 md:right-8 bottom-2 md:bottom-8 left-2 md:left-8 p-4 bg-gray-200 border-4 rounded-xl outline-0 overflow-auto">
          <Dialog.Title className="sr-only" />
          <Dialog.Description className="sr-only" />
          <ModalBody
            episodeSpecifier={episodeSpecifier}
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
  episodeSpecifier,
  episodeDescriptor,
  showTitle,
  close,
}: {
  episodeSpecifier: EpisodeSpecifier
  episodeDescriptor: EpisodeDescriptor
  showTitle: string
  close: () => void
}) {
  const [episodeDetails, setEpisodeDetails] = useState<EpisodeDetails | null>(
    episodeDetailsCache.getEpisodeDetails(episodeSpecifier),
  )
  const [isLoading, setIsLoading] = useState(false)
  const [isEpisodeMissing, setIsEpisodeMissing] = useState(false)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    if (isError) {
      return
    }

    const fetcher = async () => {
      setIsLoading(true)
      let fetchedEpisodes: EpisodeDetails[][] | null = null
      try {
        fetchedEpisodes = await episodeDetailsCache.fetchFor(
          episodeSpecifier.showId,
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
        fetchedEpisodes[episodeSpecifier.seasonNum - 1][
          episodeSpecifier.episodeIdx
        ],
      )
    }

    fetcher()
  }, [episodeSpecifier, isError])

  if (isError) {
    return (
      <div className="flex justify-between">
        <div>An error occurred loading episode information.</div>
        <EpisodeDetailDialogCloseButton close={close} />
      </div>
    )
  }

  if (isEpisodeMissing) {
    return (
      <div className="flex justify-between">
        <div>No information available for this episode.</div>
        <EpisodeDetailDialogCloseButton close={close} />
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
        episodeSpecifier={episodeSpecifier}
        episodeDescriptor={episodeDescriptor}
        episodeDetails={episodeDetails}
        showTitle={showTitle}
        close={close}
      />
    )
  )
}
