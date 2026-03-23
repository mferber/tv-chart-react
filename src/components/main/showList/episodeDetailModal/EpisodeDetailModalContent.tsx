import * as AlertDialog from "@radix-ui/react-alert-dialog"
import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useMemo } from "react"

import { useCommandExecutor } from "../../../../providers/commands/CommandExecutorProvider"
import { ToggleWatchedCommand } from "../../../../providers/commands/ToggleWatchedCommand"
import { type EpisodeDescriptor } from "../../../../types/schemas"
import { type EpisodeDetails } from "../../../../types/schemas"
import { type EpisodeSpecifier } from "../../../../types/types"
import { errorToast } from "../../../../utils/toasts"
import { findUnwatchedEpisodesUpTo } from "../../../../utils/unwatchedEpisodes"
import { Button } from "../../../misc/Button"
import { EpisodeBox } from "../EpisodeBox"
import { EpisodeDetailModalCloseButton } from "./EpisodeDetailModalCloseButton"

const RELEASE_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
})

export function ModalBodyContent({
  episodeSpecifier,
  episodeDescriptor,
  episodeDetails,
  showTitle,
  close,
}: {
  episodeSpecifier: EpisodeSpecifier
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
          episodeSpecifier={episodeSpecifier}
          episodeDescriptor={episodeDescriptor}
          episodeDetails={episodeDetails}
          close={close}
        />

        {/* Episode title */}
        <div className="text-2xl font-black">
          {episodeDetails.title ?? "Untitled"}
        </div>

        {/* Watched-up-to-here button */}
        <MarkWatchedUpToHereButton
          showTitle={showTitle}
          episodeSpecifier={episodeSpecifier}
        />

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
  episodeSpecifier,
  episodeDescriptor,
  episodeDetails,
  close,
}: {
  showTitle: string
  episodeSpecifier: EpisodeSpecifier
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
            episodeSpecifier={episodeSpecifier}
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
                Season {episodeSpecifier.seasonNum},{" "}
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
      <EpisodeDetailModalCloseButton close={close} />
    </div>
  )
}

/**
 * Toggle for watched/unwatched status of an episode. Displays as a larger
 * version of the episode box.
 */
function WatchedStatusToggle({
  episodeDescriptor,
  episodeSpecifier,
}: {
  episodeDescriptor: EpisodeDescriptor
  episodeSpecifier: EpisodeSpecifier
}) {
  const { executor } = useCommandExecutor()
  const queryClient = useQueryClient()

  const clickHandler = useCallback(async () => {
    try {
      await executor.execute(
        new ToggleWatchedCommand(queryClient, episodeSpecifier.showId, [
          {
            seasonNum: episodeSpecifier.seasonNum,
            episodeIdx: episodeSpecifier.episodeIdx,
          },
        ]),
      )
    } catch {
      errorToast(
        "An error occurred toggling episode watched status, try reloading",
      )
    }
  }, [executor, queryClient, episodeSpecifier])

  return (
    <div onClick={clickHandler}>
      <EpisodeBox
        episodeSpecifier={episodeSpecifier}
        episodeDescriptor={episodeDescriptor}
        tailwindSize="12"
      />
    </div>
  )
}

function MarkWatchedUpToHereButton({
  showTitle,
  episodeSpecifier,
}: {
  showTitle: string
  episodeSpecifier: EpisodeSpecifier
}) {
  const { executor } = useCommandExecutor()
  const queryClient = useQueryClient()

  const unwatchedEpisodes = useMemo(
    () => findUnwatchedEpisodesUpTo(episodeSpecifier, queryClient),
    [episodeSpecifier, queryClient],
  )

  const clickHandler = useCallback(async () => {
    try {
      await executor.execute(
        new ToggleWatchedCommand(
          queryClient,
          episodeSpecifier.showId,
          unwatchedEpisodes,
        ),
      )
    } catch {
      errorToast(
        "An error occurred toggling episode watched status, try reloading",
      )
    }
  }, [executor, queryClient, episodeSpecifier, unwatchedEpisodes])

  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>
        <div className="text-sm py-2">
          <Button htmlType="button" size="narrow">
            Mark watched up to here
          </Button>
        </div>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-white/80" />
        <AlertDialog.Content className="fixed w-[90vw] max-w-120 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-gray-200 border p-6 rounded-lg shadow-gray-500 shadow-lg">
          <AlertDialog.Title className="sr-only" />
          <AlertDialog.Description className="sr-only" />
          <div className="text-center font-bold mb-1">Confirm update</div>
          <div className="mb-4">
            Mark {unwatchedEpisodes.length} episode
            {unwatchedEpisodes.length === 1 ? "" : "s"} of "{showTitle}" as
            watched?
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <AlertDialog.Cancel asChild>
              <Button htmlType="button" buttonStyle="secondary">
                Cancel
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button htmlType="button" onClick={clickHandler}>
                Mark as watched
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
