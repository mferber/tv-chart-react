import clsx from "clsx"
import { type MouseEventHandler } from "react"

import { type EpisodeDescriptor } from "../../../types/schemas"
import { type EpisodeSpecifier } from "../../../types/types"

const STAR = "\u2605"

export function EpisodeBox({
  episodeSpecifier,
  episodeDescriptor,
  selected,
  tailwindSize,
  onClick,
}: {
  episodeSpecifier: EpisodeSpecifier
  episodeDescriptor: EpisodeDescriptor
  selected?: boolean
  tailwindSize?: string
  onClick: MouseEventHandler<HTMLButtonElement>
}) {
  const textClassName = clsx(
    episodeDescriptor.watched
      ? "text-white"
      : selected
        ? "text-red-800"
        : "text-black",
    "text-[55cqh]", // percentage of the container height
  )

  return (
    <button
      type="button"
      className="relative inline-block cursor-pointer"
      key={episodeSpecifier.episodeIdx}
      title={episodeDescriptor.title ?? "No title"}
      onClick={onClick}
    >
      <EpisodeSquircle
        filled={episodeDescriptor.watched}
        selected={!!selected}
        tailwindSize={tailwindSize}
      />

      {/* center the display marker -- star or episode number -- over the squircle */}
      <div className="absolute inset-0 flex items-center justify-center @container-[size]">
        <span className={textClassName}>
          {episodeDescriptor.displayNumber ?? STAR}
        </span>
      </div>
    </button>
  )
}

function EpisodeSquircle({
  filled,
  selected,
  tailwindSize,
}: {
  filled: boolean
  selected: boolean
  tailwindSize?: string
}) {
  const actualTailwindSize = tailwindSize ?? "8"
  const className = `w-${actualTailwindSize} h-${actualTailwindSize}`
  return (
    <svg
      className={className}
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
