import { MouseEvent, type SubmitEvent, useRef } from "react"
import Modal from "react-modal"

import { fetchShowSearchResults } from "../../api/client"
import {
  type ShowSearchResult,
  showSearchResultsSchema,
} from "../../schemas/schemas"
import { useSimpleQuery } from "../../utils/query"
import { ImageWithPlaceholder } from "../misc/ImageWithPlaceholder"

export function SearchModal({
  isOpen,
  close,
}: {
  isOpen: boolean
  close: () => void
}) {
  const searchFieldRef = useRef<HTMLInputElement>(null)

  // put initial focus in the search input field
  function handleAfterOpen() {
    searchFieldRef.current?.focus()
  }

  const { executeQuery, resetQuery, data, isLoading } = useSimpleQuery(
    async (searchTerm: string) => {
      const fetchResults = await fetchShowSearchResults(searchTerm)
      return showSearchResultsSchema.parse(fetchResults)
    },
  )

  function handleSubmitSearch(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.target)
    const q = (formData.get("query") ?? "").toString()
    executeQuery(q)
  }

  function closeModal() {
    resetQuery()
    close()
  }

  return (
    <Modal
      isOpen={isOpen}
      onAfterOpen={handleAfterOpen}
      overlayClassName="fixed top-0 right-0 bottom-0 left-0 bg-black/25"
      className="absolute top-8 right-8 bottom-8 left-8 p-4 border-4 rounded-xl bg-white outline-0 overflow-auto"
    >
      <div className="text-right">
        <a
          href="#"
          onClick={() => {
            closeModal()
          }}
        >
          Cancel
        </a>
      </div>
      <div>Search for a show here:</div>
      <div>
        <form onSubmit={handleSubmitSearch} className="flex gap-1">
          <input
            ref={searchFieldRef}
            type="text"
            name="query"
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
      {isLoading && "…"}
      {data && data.results && (
        <SearchResults results={data.results} closeModal={closeModal} />
      )}
    </Modal>
  )
}

function SearchResults({
  results,
  closeModal,
}: {
  results: ShowSearchResult[]
  closeModal: () => void
}) {
  return results.map((result) => (
    <SearchResult
      result={result}
      closeModal={closeModal}
      key={result.tvmaze_id}
    />
  ))
}

function SearchResult({
  result,
  closeModal,
}: {
  result: ShowSearchResult
  closeModal: () => void
}) {
  function handleAddShow(e: MouseEvent<HTMLButtonElement>, tvmaze_id: number) {
    console.log("CLICK add this show (", tvmaze_id, ")")
    closeModal()
  }

  return (
    <div className="flex flex-col" key={result.tvmaze_id}>
      <div className="mt-6 flex">
        <ImageWithPlaceholder
          src={result.image_sm_url ?? null}
          alt={result.name}
          widthClassName="w-32"
          placeholderHeightClassName="h-50"
          additionalClassNames="mr-4 mb-1"
        />
        <div>
          <button
            className="bg-red-800 text-white py-1 px-2 rounded-lg mb-2"
            onClick={(e) => handleAddShow(e, result.tvmaze_id)}
          >
            Add this show
          </button>
          <div className="text-2xl font-bold mb-1">{result.name}</div>
          <Details result={result} />

          {/* show summary for larger screens */}
          <div
            className="mt-2 text-sm hidden sm:block"
            // html is pre-sanitized on the backend
            // eslint-disable-next-line react-dom/no-dangerously-set-innerhtml
            dangerouslySetInnerHTML={{
              __html: result.summary_html ?? "(no summary available)",
            }}
          />
        </div>
      </div>

      {/* show summary for smaller screens */}
      <div
        className="text-sm block sm:hidden"
        // html is pre-sanitized on the backend
        // eslint-disable-next-line react-dom/no-dangerously-set-innerhtml
        dangerouslySetInnerHTML={{
          __html: result.summary_html ?? "(no summary available)",
        }}
      />
    </div>
  )
}

function Details({ result }: { result: ShowSearchResult }) {
  function format_years(
    start: number | null | undefined,
    end: number | null | undefined,
  ) {
    if (start && end) {
      return `${start}–${end}` // en-dash
    }
    if (start) {
      return start
    }
    if (end) {
      return end
    }
    return "(years unknown)"
  }

  function format_source(
    entity: string | null | undefined,
    entity_country: string | null | undefined,
  ): string | null {
    if (entity && entity_country) {
      return `${entity} (${entity_country})`
    }
    if (entity) {
      return entity
    }
    if (entity_country) {
      return `(${entity_country})`
    }
    return null
  }

  const years = format_years(result.start_year, result.end_year)
  const network = format_source(result.network, result.network_country)
  const streaming = format_source(
    result.streaming_service,
    result.streaming_service_country,
  )

  const sources =
    network || streaming
      ? [network, streaming].filter((x) => x).join(", ")
      : null
  const dates_and_sources = [years, sources].join(" — ") // em-dash
  const dates_and_sources_div = <div>{dates_and_sources}</div>

  const genres_div = result.genres ? (
    <div className="italic text-sm">{result.genres.join(", ")}</div>
  ) : null

  return (
    <div className="mb-2 sm:mb-2">
      {dates_and_sources_div}
      {genres_div}
    </div>
  )
}
