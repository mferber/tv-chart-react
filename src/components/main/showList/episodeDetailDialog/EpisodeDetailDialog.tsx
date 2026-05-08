import * as Dialog from "@radix-ui/react-dialog"
import { useCallback, useEffect, useState } from "react"
import { ThreeDots } from "react-loader-spinner"

import { type EpisodeDescriptor } from "../../../../types/schemas"
import { type EpisodeDetails } from "../../../../types/schemas"
import { type EpisodeSpecifier } from "../../../../types/types"
import {
  episodeDetailsCache,
  EpisodeMissingError,
} from "../../../../utils/episodesDetailsCache"
import { ThemedCloseButton } from "../../../misc/ThemedCloseButton"
import { EpisodeDetailDialogContent } from "./EpisodeDetailDialogContent"

export function EpisodeDetailDialog({
  episodeSpecifier,
  episodeDescriptor,
  showTitle,

  // function to call when the episode details box has been populated and its bounds
  // have settled down; allows us to notify the parent components so we can add
  // padding to account for the dialog's presence
  onBoundsFinalized,
  close,
}: {
  episodeSpecifier?: EpisodeSpecifier
  episodeDescriptor?: EpisodeDescriptor
  showTitle?: string
  onBoundsFinalized?: (bounds: DOMRect) => void
  close: () => void
}) {
  const isOpen = episodeSpecifier !== undefined

  return (
    <Dialog.Root modal={false} open={isOpen}>
      {episodeSpecifier && episodeDescriptor && showTitle && (
        <Dialog.Content className="fixed max-h-2/5 right-2 md:right-8 bottom-2 md:bottom-8 left-2 md:left-8 p-4 bg-stone-200 shadow-gray-500 shadow-lg border rounded-xl outline-0 overflow-auto">
          <Dialog.Title className="sr-only" />
          <Dialog.Description className="sr-only" />
          <ModalBody
            episodeSpecifier={episodeSpecifier}
            episodeDescriptor={episodeDescriptor}
            showTitle={showTitle}
            onBoundsFinalized={onBoundsFinalized}
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
  onBoundsFinalized,
  close,
}: {
  episodeSpecifier: EpisodeSpecifier
  episodeDescriptor: EpisodeDescriptor
  showTitle: string
  onBoundsFinalized?: (bounds: DOMRect) => void
  close: () => void
}) {
  const [episodeDetails, setEpisodeDetails] = useState<EpisodeDetails | null>(
    null,
  )
  const [isLoading, setIsLoading] = useState(false)
  const [isEpisodeMissing, setIsEpisodeMissing] = useState(false)
  const [isError, setIsError] = useState(false)

  const updateModalRefBounds = useCallback(
    (el: HTMLDivElement) => {
      if (!el || !onBoundsFinalized) return
      onBoundsFinalized(el.getBoundingClientRect())
    },
    [onBoundsFinalized],
  )

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
        <ThemedCloseButton onClick={close} />
      </div>
    )
  }

  if (isEpisodeMissing) {
    return (
      <div className="flex justify-between">
        <div>No information available for this episode.</div>
        <ThemedCloseButton onClick={close} />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center w-full">
        <ThreeDots color="black" width="40" height="150" />
      </div>
    )
  }

  return (
    episodeDetails && (
      <div ref={updateModalRefBounds}>
        <EpisodeDetailDialogContent
          episodeSpecifier={episodeSpecifier}
          episodeDescriptor={episodeDescriptor}
          episodeDetails={episodeDetails}
          showTitle={showTitle}
          close={close}
        />
      </div>
    )
  )
}
