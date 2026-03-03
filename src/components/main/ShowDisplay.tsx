import { use } from "react"

import { DisplayedEpisodeDetailContext } from "../../contexts/DisplayedEpisodeDetailContext"
import { type Episode, type Show } from "../../schemas/schemas"
import { ImageWithPlaceholder } from "../misc/ImageWithPlaceholder"

/**
 * An Episode, paired with a label that indicates an episode number, or a star
 * for specials.
 */
class EpisodeWithDisplayLabel {
  episode: Episode
  label: string

  constructor(episode: Episode, label: string) {
    this.episode = episode
    this.label = label
  }

  /** Pair each episode with a display marker, marking special episodes with a
   * star and otherwise assigning consecutive numbers.
   */
  static fromEpisodeList(season: Episode[]): EpisodeWithDisplayLabel[] {
    const result: EpisodeWithDisplayLabel[] = []
    let nextEpisodeNumber = 1
    for (const episode of season) {
      let label: string
      if (episode.type == "special") {
        label = "★"
      } else {
        label = (nextEpisodeNumber++).toString()
      }
      result.push(new EpisodeWithDisplayLabel(episode, label))
    }
    return result
  }
}

export function ShowDisplay({ show }: { show: Show }) {
  return (
    <section className="pb-8">
      <ShowDisplayHeader show={show} />
      <div className="flex flex-col gap-2">
        {show.seasons.map((season, idx) => (
          <SeasonDisplay
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

function ShowDisplayHeader({ show }: { show: Show }) {
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

function SeasonDisplay({
  showId,
  season,
  seasonNum,
}: {
  showId: string
  season: Episode[]
  seasonNum: number
}) {
  const episodesWithDisplayLabels =
    EpisodeWithDisplayLabel.fromEpisodeList(season)

  return (
    <div className="flex gap-8 items-center">
      <span className="w-2 shrink-0 text-2xl">{seasonNum}</span>
      <span className="flex gap-1">
        {episodesWithDisplayLabels.map((ep, idx) => (
          <EpisodeDisplay
            episodeWithDisplayLabel={ep}
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

function EpisodeDisplay({
  episodeWithDisplayLabel,
  showId,
  seasonNumber,
  episodeIndex,
}: {
  episodeWithDisplayLabel: EpisodeWithDisplayLabel
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
      title={episodeWithDisplayLabel.episode.title ?? "No title"}
      onClick={() => {
        setDisplayedEpisodeDetail({
          showId: showId,
          seasonNum: seasonNumber,
          episodeIdx: episodeIndex,
        })
      }}
    >
      <EpisodeSquircle filled={episodeWithDisplayLabel.episode.watched} />

      {/* center the display marker -- star or episode number -- over the squircle */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={
            episodeWithDisplayLabel.episode.watched
              ? "text-white"
              : "text-black"
          }
        >
          {episodeWithDisplayLabel.label}
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
