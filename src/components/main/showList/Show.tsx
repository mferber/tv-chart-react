import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { useQueryClient } from "@tanstack/react-query"
import { Info, Trash2 } from "lucide-react"
import React, { type ReactNode, use, useEffect, useRef, useState } from "react"

import { SelectedEpisodeContext } from "../../../contexts/SelectedEpisodeContext"
import { useCommandExecutor } from "../../../providers/commands/CommandExecutorProvider"
import { DeleteShowCommand } from "../../../providers/commands/DeleteShowCommand"
import { SHOWS_QUERY_KEY } from "../../../providers/ShowsQueryProvider"
import { type EpisodeDescriptor, type Show } from "../../../types/schemas"
import { type EpisodeSpecifier } from "../../../types/types"
import { ImageWithPlaceholder } from "../../misc/ImageWithPlaceholder"
import { ThemedAlert } from "../../misc/ThemedAlert"
import {
  ThemedDropdownMenuContent,
  ThemedDropdownMenuItem,
  ThemedDropdownMenuSeparator,
} from "../../misc/ThemedDropdownMenu"
import { EpisodeBox } from "./EpisodeBox"

/**
 * Displays seasons and episodes for a given show
 * @param show the show to display
 */
export function Show({
  show,
  selectedEpisode,
}: {
  show: Show
  selectedEpisode?: EpisodeSpecifier
}) {
  return (
    <section className="pb-8">
      <ShowHeader show={show} />
      <div className="flex flex-col gap-2">
        {show.seasons.map((season, idx) => (
          <Season
            showId={show.id}
            season={season}
            seasonNum={idx + 1}
            selectedEpisode={selectedEpisode}
            // eslint-disable-next-line react-x/no-array-index-key
            key={idx}
          />
        ))}
      </div>
    </section>
  )
}

function ShowHeader({ show }: { show: Show }) {
  const { executor } = useCommandExecutor()
  const queryClient = useQueryClient()

  return (
    <div className="flex gap-2 mb-4">
      <ImageWithPlaceholder
        src={show.image_sm_url || null}
        alt={show.title}
        widthClassName="w-16"
        placeholderHeightClassName="h-20"
      />
      <div className="flex flex-col items-start">
        <header className="text-xl font-medium">{show.title}</header>
        <div className="font-extralight">
          {show.source}, {show.duration} min.
        </div>
        <div className="flex gap-3 items-center mt-2 sm:gap-1">
          <ThemedAlert
            trigger={
              <span className="hover:cursor-pointer hover:text-red-800">
                <Trash2 className="w-6 h-6" strokeWidth="1" />
              </span>
            }
            body={<div>Are you sure you want to delete {show.title}?</div>}
            actionButtonText="Delete"
            onAction={async () => {
              await executor.execute(new DeleteShowCommand(show.id))
              queryClient.invalidateQueries({ queryKey: SHOWS_QUERY_KEY })
            }}
          />
          <ShowInfoDropDownMenu
            show={show}
            trigger={
              <span className="hover:cursor-pointer hover:text-red-800">
                <Info className="w-6 h-6" strokeWidth="1" />
              </span>
            }
          />
        </div>
      </div>
    </div>
  )
}

function ShowInfoDropDownMenu({
  show,
  trigger,
}: {
  show: Show
  trigger: ReactNode
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="focus-visible:outline-none">
        {trigger}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <ThemedDropdownMenuContent>
          <ThemedDropdownMenuItem nonselectable>
            <div className="font-bold">{show.title}</div>
          </ThemedDropdownMenuItem>
          <ThemedDropdownMenuSeparator />
          <ThemedDropdownMenuItem nonselectable>
            <div className="font-bold">View on:</div>
          </ThemedDropdownMenuItem>
          <ThemedDropdownMenuItem>
            <a target="_blank" href={`https://imdb.com/title/${show.imdb_id}`}>
              → IMDB
            </a>
          </ThemedDropdownMenuItem>
          <ThemedDropdownMenuItem>
            <a
              target="_blank"
              href={`https://tvmaze.com/shows/${show.tvmaze_id}`}
            >
              → TVmaze
            </a>
          </ThemedDropdownMenuItem>
          {show.thetvdb_id && (
            <ThemedDropdownMenuItem>
              <a
                target="_blank"
                href={`https://www.thetvdb.com/dereferrer/series/${show.thetvdb_id}`}
              >
                → TheTVDB
              </a>
            </ThemedDropdownMenuItem>
          )}
          <ThemedDropdownMenuItem>
            <a
              target="_blank"
              href={`https://en.wikipedia.org/wiki/${show.title}`}
            >
              → Wikipedia
            </a>
          </ThemedDropdownMenuItem>
          {/* 
                Commented out pending support for this functionality
                <ThemedDropdownMenuSeparator />
                <ThemedDropdownMenuItem><a href="#"><div>Refresh episode listings</div></a></ThemedDropdownMenuItem>
                */}
        </ThemedDropdownMenuContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

function Season({
  showId,
  season,
  seasonNum,
  selectedEpisode,
}: {
  showId: string
  season: EpisodeDescriptor[]
  seasonNum: number
  selectedEpisode?: EpisodeSpecifier
}) {
  const { setSelectedEpisode } = use(SelectedEpisodeContext)
  const [renderRowFully, setRenderRowFully] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  // Use IntersectionObserver to only render full EpisodeBoxes when this season's
  // row is onscreen or nearly onscreen -- the rest of the time, render a simple
  // placeholder. The placeholders are rarely visible except when scrolling very
  // fast, and even then they're barely perceptible.
  //
  // This is necessary to reduce the number of inline SVGs that are in the DOM at
  // the same time; otherwise horizontal scrolling of long seasons becomes
  // unacceptably janky on iOS, which has limited rendering resources.
  //
  // This approach does make vertical scrolling very slightly janky due to
  // interrupting the scroll to mount and unmount SVGs, but it's far less
  // noticeable than the horizontal scrolling problems it solves.
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) =>
        React.startTransition(() => setRenderRowFully(entry.isIntersecting)),
      { rootMargin: "200px" }, // preload slightly before entering viewport
    )
    if (ref.current) {
      observer.observe(ref.current)
    }
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="flex gap-8 items-center">
      <span className="w-2 shrink-0 text-2xl">{seasonNum}</span>
      <span className="flex gap-1 items-center overflow-x-auto whitespace-nowrap [scrollbar-width:none]">
        {season.map((ep, idx) => {
          if (!renderRowFully) {
            return (
              // eslint-disable-next-line react-x/no-array-index-key
              <div className="w-8 h-8 shrink-0 bg-stone-200" key={idx}>
                {" "}
              </div>
            )
          }

          const episodeSpecifier = {
            showId: showId,
            seasonNum: seasonNum,
            episodeIdx: idx,
          }
          const selected =
            selectedEpisode !== undefined &&
            selectedEpisode.showId === showId &&
            selectedEpisode.seasonNum === seasonNum &&
            selectedEpisode.episodeIdx === idx

          const clickHandler: React.MouseEventHandler<HTMLButtonElement> = (
            e,
          ) => {
            setSelectedEpisode({
              showId: showId,
              seasonNum: seasonNum,
              episodeIdx: idx,
            })
            // prevent the event from propagating to the ShowList and closing the details dialog
            e.stopPropagation()
          }

          return (
            <EpisodeBox
              episodeSpecifier={episodeSpecifier}
              episodeDescriptor={ep}
              selected={selected}
              onClick={clickHandler}
              // eslint-disable-next-line react-x/no-array-index-key
              key={idx}
            />
          )
        })}
        {
          <span className="text-lg" title="end-of-season indicator">
            {"\u2666"}
          </span>
        }
      </span>
    </div>
  )
}
