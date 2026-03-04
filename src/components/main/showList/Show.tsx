import { use } from "react"

import { DisplayedEpisodeDetailContext } from "../../../contexts/DisplayedEpisodeDetailContext"
import { type EpisodeDescriptor, type Show } from "../../../types/schemas"
import { EpisodeWithDisplayNumber } from "../../../types/types"
import { ImageWithPlaceholder } from "../../misc/ImageWithPlaceholder"

const STAR = "\u2605"

/**
 * Displays seasons and episodes for a given show
 * @param show the show to display
 */
export function Show({ show }: { show: Show }) {
  return (
    <section className="pb-8">
      <ShowHeader show={show} />
      <div className="flex flex-col gap-2">
        {show.seasons.map((season, idx) => (
          <Season
            showId={show.id}
            season={season}
            seasonNum={idx + 1}
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
      <div className="flex flex-col">
        <header className="text-xl font-black">{show.title}</header>
        <span>
          {show.source}, {show.duration} min.
        </span>
      </div>
    </div>
  )
}

function Season({
  showId,
  season,
  seasonNum,
}: {
  showId: string
  season: EpisodeDescriptor[]
  seasonNum: number
}) {
  const episodesWithDisplayLabels =
    EpisodeWithDisplayNumber.fromEpisodeList(season)

  return (
    <div className="flex gap-8 items-center">
      <span className="w-2 shrink-0 text-2xl">{seasonNum}</span>
      <span className="flex gap-1">
        {episodesWithDisplayLabels.map((ep, idx) => (
          <EpisodeBox
            episodeWithDisplayNumber={ep}
            showId={showId}
            seasonNumber={seasonNum}
            episodeIndex={idx}
            // eslint-disable-next-line react-x/no-array-index-key
            key={idx}
          />
        ))}
      </span>
    </div>
  )
}

function EpisodeBox({
  episodeWithDisplayNumber,
  showId,
  seasonNumber,
  episodeIndex,
}: {
  episodeWithDisplayNumber: EpisodeWithDisplayNumber
  showId: string
  seasonNumber: number
  episodeIndex: number
}) {
  const { setDisplayedEpisodeDetail } = use(DisplayedEpisodeDetailContext)

  return (
    <button
      type="button"
      className="relative inline-block"
      key={episodeIndex}
      title={episodeWithDisplayNumber.episode.title ?? "No title"}
      onClick={() => {
        setDisplayedEpisodeDetail({
          showId: showId,
          seasonNum: seasonNumber,
          episodeIdx: episodeIndex,
          episodeDisplayNumber: episodeWithDisplayNumber.displayNum,
        })
      }}
    >
      <EpisodeSquircle filled={episodeWithDisplayNumber.episode.watched} />

      {/* center the display marker -- star or episode number -- over the squircle */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={
            episodeWithDisplayNumber.episode.watched
              ? "text-white"
              : "text-black"
          }
        >
          {episodeWithDisplayNumber.displayNum ?? STAR}
        </span>
      </div>
    </button>
  )
}

function EpisodeSquircle({ filled }: { filled: boolean }) {
  return (
    <svg
      className="w-8 h-8"
      viewBox="-5 -5 110 110"
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      fill={filled ? "#000" : "#fff"}
      stroke="#000"
      strokeWidth="10"
    >
      <path
        d="M 0 50 C 0 7.500000000000001, 7.500000000000001 0,
          50 0 S 100 7.500000000000001, 100 50, 92.5 100 50 100,
          0 92.5, 0 50"
        transform="rotate(0, 50, 50) translate(0, 0)"
      />
    </svg>
  )
}
