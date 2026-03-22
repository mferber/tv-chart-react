import * as AlertDialog from "@radix-ui/react-alert-dialog"
import { useQueryClient } from "@tanstack/react-query"

import { useCommandExecutor } from "../../../../providers/commands/CommandExecutorProvider"
import { ToggleWatchedCommand } from "../../../../providers/commands/ToggleWatchedCommand"
import { type EpisodeDescriptor } from "../../../../types/schemas"
import { type EpisodeDetails } from "../../../../types/schemas"
import { type EpisodeSpecifier } from "../../../../types/types"
import { errorToast } from "../../../../utils/toasts"
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

        {/* Watched-up-to-here button */}
        <MarkWatchedUpToHereButton />

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

function MarkWatchedUpToHereButton() {
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
        <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-gray-200 border p-6 rounded-lg shadow-gray-500 shadow-lg">
          <AlertDialog.Title className="sr-only" />
          <AlertDialog.Description className="sr-only" />
          <div className="text-center font-bold mb-1">Confirm update</div>
          <div className="mb-4">
            Mark X number of episodes of Show Title as [un]read?
          </div>
          <div className="flex gap-4 justify-end">
            <AlertDialog.Cancel asChild>
              <Button htmlType="button" buttonStyle="secondary">
                Cancel
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button htmlType="button" onClick={() => console.log("Marking")}>
                Mark [un]read
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
