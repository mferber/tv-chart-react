import Modal from "react-modal"

import { type EpisodeSpecifier } from "../../contexts/DisplayedEpisodeDetailContext"
import { type ShowRecord } from "../../schemas/schemas"

export function EpisodeDetailModal({
  episodeDetailSpecifier,
  shows,
  close,
}: {
  episodeDetailSpecifier: EpisodeSpecifier | null
  shows: ShowRecord
  close: () => void
}) {
  return (
    <Modal isOpen={episodeDetailSpecifier !== null}>
      {episodeDetailSpecifier && (
        <ModalBody
          episodeDetailSpecifier={episodeDetailSpecifier}
          shows={shows}
          close={close}
        />
      )}
    </Modal>
  )
}

function ModalBody({
  episodeDetailSpecifier,
  shows,
  close,
}: {
  episodeDetailSpecifier: EpisodeSpecifier
  shows: ShowRecord
  close: () => void
}) {
  function isWatched(
    shows: ShowRecord,
    episodeDetailSpecifier: EpisodeSpecifier,
  ): boolean {
    const show = shows[episodeDetailSpecifier.showId]
    const seasonIdx = episodeDetailSpecifier.seasonNum - 1
    const episodeIdx = episodeDetailSpecifier.episodeIdx

    return show.seasons[seasonIdx][episodeIdx].watched
  }

  return (
    <div>
      <div className="text-right">
        <button type="button" onClick={close}>
          Cancel
        </button>
      </div>
      <div>
        <div className="bold text-lg">
          {shows[episodeDetailSpecifier.showId].title}
        </div>
        <div className="text-xs">{episodeDetailSpecifier.showId}</div>
        <div className="">
          Season {episodeDetailSpecifier.seasonNum}, episode index{" "}
          {episodeDetailSpecifier.episodeIdx}
        </div>
        <div>
          {isWatched(shows, episodeDetailSpecifier) ? "WATCHED" : "unwatched"}
        </div>
      </div>
    </div>
  )
}
