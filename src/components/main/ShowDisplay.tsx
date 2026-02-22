import { type Episode, type Show } from "../../schemas/schemas"

type DisplayableEpisode = {
  episode: Episode
  marker: string
}

/** Assign each episode a display marker, marking special episodes with a
    star and otherwise assigning consecutive numbers.
*/
function asDisplayableEpisodes(season: Episode[]): DisplayableEpisode[] {
  const result: DisplayableEpisode[] = []
  let nextEpisodeNumber = 1
  for (const episode of season) {
    let marker: string
    if (episode.type == "special") {
      marker = "★"
    } else {
      marker = (nextEpisodeNumber++).toString()
    }
    result.push({ episode: episode, marker: marker })
  }
  return result
}

export function ShowDisplay({ show }: { show: Show }) {
  return (
    <section className="pb-8">
      <ShowDisplayHeader show={show} />
      <div className="flex flex-col gap-2">
        {show.seasons.map((season, idx) => (
          // eslint-disable-next-line react-x/no-array-index-key
          <SeasonDisplay season={season} num={idx + 1} key={idx} />
        ))}
      </div>
    </section>
  )
}

function ShowDisplayHeader({ show }: { show: Show }) {
  return (
    <div className="flex gap-2 mb-4">
      <img src={show.image_sm_url} className="w-16" />
      <div className="flex flex-col">
        <header className="text-xl font-black">{show.title}</header>
        <span>
          {show.source}, {show.duration} min.
        </span>
      </div>
    </div>
  )
}

function SeasonDisplay({ season, num }: { season: Episode[]; num: number }) {
  return (
    <div className="flex gap-8 items-center">
      <span className="w-2 shrink-0 text-2xl">{num}</span>
      <span className="flex gap-1">
        {asDisplayableEpisodes(season).map((ep, idx) => (
          <NumberedEpisodeDisplay
            displayable_episode={ep}
            episode_index={idx}
            // eslint-disable-next-line react-x/no-array-index-key
            key={idx}
          />
        ))}
      </span>
    </div>
  )
}

function NumberedEpisodeDisplay({
  displayable_episode,
  episode_index,
}: {
  displayable_episode: DisplayableEpisode
  episode_index: number
}) {
  return (
    <span className="relative inline-block" key={episode_index}>
      <EpisodeSquircle filled={displayable_episode.episode.watched} />
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={
            displayable_episode.episode.watched ? "text-white" : "text-black"
          }
        >
          {displayable_episode.marker}
        </span>
      </div>
    </span>
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
