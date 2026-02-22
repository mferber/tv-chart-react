import { type SubmitEvent } from "react"
import Modal from "react-modal"

export function SearchModal({
  isOpen,
  close,
}: {
  isOpen: boolean
  close: () => void
}) {
  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.target)
    const query = formData.get("show-query")
    alert(query)
  }

  return (
    <Modal
      isOpen={isOpen}
      overlayClassName="fixed top-0 right-0 bottom-0 left-0 bg-black/25"
      className="absolute top-8 right-8 bottom-8 left-8 p-4 border-4 rounded-xl bg-white outline-0 overflow-auto"
    >
      <div className="text-right">
        <a href="#" onClick={() => close()}>
          Cancel
        </a>
      </div>
      <div>Search for a show here:</div>
      <div>
        <form onSubmit={handleSubmit} className="flex gap-1">
          <input
            type="text"
            name="show-query"
            className="flex-1 max-w-80 min-w-8 px-2 py-1 border rounded-md"
          />
          <button
            type="submit"
            className="px-4 py-1 text-white bg-red-800 border-red-800 border-2 rounded-md"
          >
            Search
          </button>
        </form>
      </div>
    </Modal>
  )
}
