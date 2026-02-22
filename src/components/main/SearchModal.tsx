import Modal from "react-modal"

export function SearchModal({
  isOpen,
  close,
}: {
  isOpen: boolean
  close: () => void
}) {
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
      Search here
    </Modal>
  )
}
