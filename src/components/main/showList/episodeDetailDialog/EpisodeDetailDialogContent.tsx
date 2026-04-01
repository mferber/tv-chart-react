import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useMemo } from "react"

import { useCommandExecutor } from "../../../../providers/commands/CommandExecutorProvider"
import { ToggleWatchedCommand } from "../../../../providers/commands/ToggleWatchedCommand"
import { SHOWS_QUERY_KEY } from "../../../../providers/ShowsQueryProvider"
import {
  type EpisodeDescriptor,
  type ShowRecord,
} from "../../../../types/schemas"
import { type EpisodeDetails } from "../../../../types/schemas"
import { type EpisodeSpecifier } from "../../../../types/types"
import { errorToast } from "../../../../utils/toasts"
import { findUnwatchedEpisodesUpTo } from "../../../../utils/unwatchedEpisodes"
import { ThemedAlert } from "../../../misc/ThemedAlert"
import { ThemedButton } from "../../../misc/ThemedButton"
import { EpisodeBox } from "../EpisodeBox"
import { EpisodeDetailDialogCloseButton } from "./EpisodeDetailDialogCloseButton"

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
        <div className="text-2xl font-light">
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
              <span className="font-light">{showTitle}</span>
            </div>

            {/* Episode info */}
            <div className="text-sm">
              <span className="font-medium">
                Season {episodeSpecifier.seasonNum},{" "}
                {episodeDescriptor.ep_num === null
                  ? "special"
                  : `episode ${episodeDescriptor.ep_num}`}
              </span>
              {episodeDetails.duration && (
                <span> ({episodeDetails.duration} min.)</span>
              )}
            </div>
          </div>
        </div>
      </div>
      <EpisodeDetailDialogCloseButton close={close} />
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
    const data = queryClient.getQueryData<ShowRecord>(SHOWS_QUERY_KEY)
    const showTitle = data
      ? `“${data[episodeSpecifier.showId].title}”`
      : "(title not found)"

    try {
      await executor.execute(
        new ToggleWatchedCommand(
          queryClient,
          episodeSpecifier.showId,
          showTitle,
          [
            {
              seasonNum: episodeSpecifier.seasonNum,
              episodeIdx: episodeSpecifier.episodeIdx,
            },
          ],
        ),
      )
    } catch {
      errorToast(
        "An error occurred toggling episode watched status, try reloading",
      )
    }
  }, [executor, queryClient, episodeSpecifier])

  return (
    <EpisodeBox
      episodeSpecifier={episodeSpecifier}
      episodeDescriptor={episodeDescriptor}
      size="large"
      onClick={clickHandler}
    />
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
    const data = queryClient.getQueryData<ShowRecord>(SHOWS_QUERY_KEY)
    const showTitle = data
      ? `“${data[episodeSpecifier.showId].title}”`
      : "(title not found)"

    try {
      await executor.execute(
        new ToggleWatchedCommand(
          queryClient,
          episodeSpecifier.showId,
          showTitle,
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
    <ThemedAlert
      trigger={
        <div className="text-sm py-2">
          <ThemedButton htmlType="button" size="narrow">
            Mark watched up to here
          </ThemedButton>
        </div>
      }
      triggerAsChild
      body={
        <>
          <div className="text-lg font-bold mb-1">Confirm update</div>
          <div className="mb-4">
            Mark {unwatchedEpisodes.length} episode
            {unwatchedEpisodes.length === 1 ? "" : "s"} of “{showTitle}” as
            watched?
          </div>
        </>
      }
      actionButtonText="Mark as watched"
      onAction={clickHandler}
    />
  )
}
