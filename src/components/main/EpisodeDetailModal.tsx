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
    const show = shows[episodeDetailSpecifier.show_id]
    const seasonIdx = episodeDetailSpecifier.season_num - 1
    const episodeIdx = episodeDetailSpecifier.episode_idx

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
          {shows[episodeDetailSpecifier.show_id].title}
        </div>
        <div className="text-xs">{episodeDetailSpecifier.show_id}</div>
        <div className="">
          Season {episodeDetailSpecifier.season_num}, episode index{" "}
          {episodeDetailSpecifier.episode_idx}
        </div>
        <div>
          {isWatched(shows, episodeDetailSpecifier) ? "WATCHED" : "unwatched"}
        </div>
      </div>
    </div>
  )
}
