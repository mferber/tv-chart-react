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
import { EpisodeDetailModalCloseButton } from "./EpisodeDetailModalCloseButton"
import { ModalBodyContent } from "./EpisodeDetailModalContent"

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
        <Dialog.Content className="fixed max-h-2/5 right-2 md:right-8 bottom-2 md:bottom-8 left-2 md:left-8 p-4 bg-gray-200 border-4 rounded-xl outline-0 overflow-auto">
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
        <EpisodeDetailModalCloseButton close={close} />
      </div>
    )
  }

  if (isEpisodeMissing) {
    return (
      <div className="flex justify-between">
        <div>No information available for this episode.</div>
        <EpisodeDetailModalCloseButton close={close} />
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
