import { QueryClient, useQueryClient } from "@tanstack/react-query"
import { Square, SquareCheck } from "lucide-react"
import { useMemo } from "react"

import {
  CommandExecutor,
  useCommandExecutor,
} from "../../../../providers/commands/CommandExecutorProvider"
import { ToggleWatchedCommand } from "../../../../providers/commands/ToggleWatchedCommand"
import { SHOWS_QUERY_KEY } from "../../../../providers/ShowsQueryProvider"
import {
  type EpisodeDescriptor,
  type ShowRecord,
} from "../../../../types/schemas"
import { type EpisodeDetails } from "../../../../types/schemas"
import {
  type EpisodeSpecifier,
  type PartialEpisodeSpecifier,
} from "../../../../types/types"
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

const toggleWatchedMultiple = async (
  executor: CommandExecutor,
  showId: string,
  episodeSpecifiers: PartialEpisodeSpecifier[],
  queryClient: QueryClient,
) => {
  const data = queryClient.getQueryData<ShowRecord>(SHOWS_QUERY_KEY)
  const showTitle = data ? `“${data[showId].title}”` : "(title not found)"

  try {
    await executor.execute(
      new ToggleWatchedCommand(
        queryClient,
        showId,
        showTitle,
        episodeSpecifiers,
      ),
    )
  } catch {
    errorToast(
      "An error occurred toggling episode watched status, try reloading",
    )
  }
}

const toggleWatchedSingle = async (
  executor: CommandExecutor,
  episodeSpecifier: EpisodeSpecifier,
  queryClient: QueryClient,
) => {
  toggleWatchedMultiple(
    executor,
    episodeSpecifier.showId,
    [
      {
        seasonNum: episodeSpecifier.seasonNum,
        episodeIdx: episodeSpecifier.episodeIdx,
      },
    ],
    queryClient,
  )
}

export function EpisodeDetailDialogContent({
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
        {/* Toggleable episode box, show title and episode info; close button */}
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

        <MarkWatchedControlBar
          showTitle={showTitle}
          episodeSpecifier={episodeSpecifier}
          episodeDescriptor={episodeDescriptor}
        />

        {/* Episode summary - note HTML from TVmaze has been pre-sanitized on the backend */}
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
  const { executor } = useCommandExecutor()
  const queryClient = useQueryClient()

  return (
    <div className="flex justify-between">
      <div>
        <div className="flex items-start gap-2">
          {/* Big watched-status box, clickable to toggle */}
          <EpisodeBox
            episodeSpecifier={episodeSpecifier}
            episodeDescriptor={episodeDescriptor}
            size="large"
            onClick={async () =>
              await toggleWatchedSingle(executor, episodeSpecifier, queryClient)
            }
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

function MarkWatchedControlBar({
  showTitle,
  episodeSpecifier,
  episodeDescriptor,
}: {
  showTitle: string
  episodeSpecifier: EpisodeSpecifier
  episodeDescriptor: EpisodeDescriptor
}) {
  const { executor } = useCommandExecutor()
  const queryClient = useQueryClient()

  return (
    <div
      className="flex px-2 my-2 bg-stone-300 rounded-lg items-center justify-between"
      onClick={async () =>
        toggleWatchedSingle(executor, episodeSpecifier, queryClient)
      }
    >
      <span className="flex gap-1 items-center w-30 font-light cursor-pointer">
        {episodeDescriptor.watched ? (
          <>
            <SquareCheck className="inline w-8 h-8" /> Watched
          </>
        ) : (
          <>
            <Square className="inline w-8 h-8" /> Unwatched
          </>
        )}
      </span>

      {/* Watched-up-to-here button */}
      <MarkWatchedUpToHereButton
        showTitle={showTitle}
        episodeSpecifier={episodeSpecifier}
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

  const clickHandler = async () =>
    await toggleWatchedMultiple(
      executor,
      episodeSpecifier.showId,
      unwatchedEpisodes,
      queryClient,
    )

  return (
    <ThemedAlert
      trigger={
        <span className="text-sm py-2">
          <ThemedButton htmlType="button">Mark watched up to here</ThemedButton>
        </span>
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
