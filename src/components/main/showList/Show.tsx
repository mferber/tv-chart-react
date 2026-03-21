import { faEllipsis } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"

import { type EpisodeDescriptor, type Show } from "../../../types/schemas"
import type { EpisodeSpecifier } from "../../../types/types"
import {
  CustomDropdownMenuContent,
  CustomDropdownMenuItem,
  CustomDropdownMenuSeparator,
} from "../../misc/CustomDropdownMenu"
import { ImageWithPlaceholder } from "../../misc/ImageWithPlaceholder"
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
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <span className="hover:cursor-pointer">
                <FontAwesomeIcon icon={faEllipsis} size="lg" />
              </span>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <CustomDropdownMenuContent>
                <CustomDropdownMenuItem>
                  <div className="font-bold">{show.title}</div>
                </CustomDropdownMenuItem>
                <CustomDropdownMenuSeparator />
                <CustomDropdownMenuItem>
                  <a
                    target="_blank"
                    href={`https://imdb.com/title/${show.imdb_id}`}
                  >
                    <div>View on IMDB</div>
                  </a>
                </CustomDropdownMenuItem>
                <CustomDropdownMenuItem>
                  <a
                    target="_blank"
                    href={`https://tvmaze.com/shows/${show.tvmaze_id}`}
                  >
                    <div>View on TVmaze</div>
                  </a>
                </CustomDropdownMenuItem>
                <CustomDropdownMenuItem>
                  <a
                    target="_blank"
                    href={`https://en.wikipedia.org/wiki/${show.title}`}
                  >
                    <div>View on Wikipedia</div>
                  </a>
                </CustomDropdownMenuItem>
                {/* 
                Commented out pending support for this functionality
                <CustomDropdownMenuSeparator />
                <CustomDropdownMenuItem><a href="#"><div>Refresh episode listings</div></a></CustomDropdownMenuItem>
                */}
              </CustomDropdownMenuContent>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>
    </div>
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
            // eslint-disable-next-line react-x/no-array-index-key
            key={idx}
          />
        ))}
      </span>
    </div>
  )
}
