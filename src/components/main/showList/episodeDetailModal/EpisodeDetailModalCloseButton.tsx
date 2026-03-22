export function EpisodeDetailModalCloseButton({
  close,
}: {
  close: () => void
}) {
  return (
    <div>
      <button type="button" onClick={close}>
        Close
      </button>
    </div>
  )
}
