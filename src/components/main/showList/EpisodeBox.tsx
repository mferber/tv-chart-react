import { use } from "react"

import { DisplayedEpisodeDetailSpecifierContext } from "../../../contexts/DisplayedEpisodeDetailSpecifierContext"
import { type EpisodeDescriptor } from "../../../types/schemas"
import type { EpisodeSpecifier } from "../../../types/types"

const STAR = "\u2605"

export function EpisodeBox({
  episodeSpecifier,
  episodeDescriptor,
  selected,
}: {
  episodeSpecifier: EpisodeSpecifier
  episodeDescriptor: EpisodeDescriptor
  selected?: boolean
}) {
  const { setDisplayedEpisodeDetailSpecifier } = use(
    DisplayedEpisodeDetailSpecifierContext,
  )

  return (
    <button
      type="button"
      className="relative inline-block"
      key={episodeSpecifier.episodeIdx}
      title={episodeDescriptor.title ?? "No title"}
      onClick={() => {
        setDisplayedEpisodeDetailSpecifier(episodeSpecifier)
      }}
    >
      <EpisodeSquircle
        filled={episodeDescriptor.watched}
        selected={!!selected}
      />

      {/* center the display marker -- star or episode number -- over the squircle */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={
            episodeDescriptor.watched
              ? "text-white"
              : selected
                ? "text-red-800"
                : "text-black"
          }
        >
          {episodeDescriptor.displayNumber ?? STAR}
        </span>
      </div>
    </button>
  )
}

function EpisodeSquircle({
  filled,
  selected,
}: {
  filled: boolean
  selected: boolean
}) {
  return (
    <svg
      className="w-8 h-8"
      viewBox="-5 -5 110 110"
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      fill={
        filled ? (selected ? "#9f0712" : "#000") : selected ? "#fdd" : "#fff"
      }
      stroke={selected ? "#9f0712" : "#000"}
      strokeWidth="5"
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
