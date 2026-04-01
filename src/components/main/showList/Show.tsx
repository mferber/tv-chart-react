import { faCircleInfo } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { type ReactNode, use } from "react"

import { SelectedEpisodeContext } from "../../../contexts/SelectedEpisodeContext"
import { type EpisodeDescriptor, type Show } from "../../../types/schemas"
import { type EpisodeSpecifier } from "../../../types/types"
import { ImageWithPlaceholder } from "../../misc/ImageWithPlaceholder"
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
  return (
    <div className="flex gap-2 mb-4">
      <ImageWithPlaceholder
        src={show.image_sm_url || null}
        alt={show.title}
        widthClassName="w-16"
        placeholderHeightClassName="h-20"
      />
      <div className="flex flex-col items-start">
        <header className="text-xl font-black">{show.title}</header>
        <div>
          {show.source}, {show.duration} min.
        </div>
        <div className="mt-2">
          <ShowInfoDropDownMenu
            show={show}
            trigger={
              <span className="text-lg hover:cursor-pointer hover:text-red-800">
                <FontAwesomeIcon icon={faCircleInfo} />
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

  return (
    <div className="flex gap-8 items-center">
      <span className="w-2 shrink-0 text-2xl">{seasonNum}</span>
      <span className="flex gap-1">
        {season.map((ep, idx) => (
          <EpisodeBox
            episodeSpecifier={{
              showId: showId,
              seasonNum: seasonNum,
              episodeIdx: idx,
            }}
            episodeDescriptor={ep}
            selected={
              selectedEpisode !== undefined &&
              selectedEpisode.showId === showId &&
              selectedEpisode.seasonNum === seasonNum &&
              selectedEpisode.episodeIdx === idx
            }
            onClick={(e) => {
              setSelectedEpisode({
                showId: showId,
                seasonNum: seasonNum,
                episodeIdx: idx,
              })
              // prevent the event from propagating to the ShowList and closing the details dialog
              e.stopPropagation()
            }}
            // eslint-disable-next-line react-x/no-array-index-key
            key={idx}
          />
        ))}
      </span>
    </div>
  )
}
