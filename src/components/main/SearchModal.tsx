import {
  type MouseEvent,
  type RefObject,
  type SubmitEvent,
  useRef,
  useState,
} from "react"
import { toast } from "react-hot-toast"
import Modal from "react-modal"

import { addShowFromTVmazeId, fetchShowSearchResults } from "../../api/client"
import { Button } from "../../components/misc/Button"
import {
  type Show,
  showSchema,
  type ShowSearchResult,
  showSearchResultsSchema,
} from "../../schemas/schemas"
import { useSimpleQuery } from "../../utils/query"
import { ImageWithPlaceholder } from "../misc/ImageWithPlaceholder"

export function SearchModal({
  isOpen,
  close,
  shows,
}: {
  isOpen: boolean
  close: () => void
  shows: Show[] | undefined
}) {
  // put initial focus in the search input field
  const searchFieldRef = useRef<HTMLInputElement>(null)
  function handleAfterOpen() {
    searchFieldRef.current?.focus()
  }

  return (
    <Modal
      isOpen={isOpen}
      onAfterOpen={handleAfterOpen}
      overlayClassName="fixed top-0 right-0 bottom-0 left-0 bg-black/25"
      className="absolute top-8 right-8 bottom-8 left-8 p-4 border-4 rounded-xl bg-white outline-0 overflow-auto"
    >
      <ModalContent
        searchFieldRef={searchFieldRef}
        close={close}
        shows={shows}
      />
    </Modal>
  )
}

function ModalContent({
  searchFieldRef,
  close,
  shows,
}: {
  searchFieldRef: RefObject<HTMLInputElement | null>
  close: () => void
  shows: Show[] | undefined
}) {
  const [addingTVmazeIDInProgress, setAddingTVmazeIDInProgress] = useState<
    number | null
  >(null)

  const { executeQuery, resetQuery, data, isLoading } = useSimpleQuery(
    async (searchTerm: string) => {
      const fetchResults = await fetchShowSearchResults(searchTerm)
      return showSearchResultsSchema.parse(fetchResults)
    },
  )

  const owned_show_tvmaze_ids = shows ? shows.map((s) => s.tvmaze_id) : []

  function resetAndCloseModal() {
    resetQuery()
    close()
  }

  function handleSubmitSearch(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.target)
    const q = (formData.get("query") ?? "").toString()
    executeQuery(q)
  }

  return (
    <>
      <div className="text-right">
        <a
          href="#"
          onClick={() => {
            resetAndCloseModal()
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
          <Button htmlType="submit" disabled={isLoading}>
            Search
          </Button>
        </form>
      </div>
      {isLoading && "…"}
      {data && data.results && (
        <SearchResults
          results={data.results}
          owned_show_tvmaze_ids={owned_show_tvmaze_ids}
          addingTVmazeIDInProgress={addingTVmazeIDInProgress}
          setAddingTVmazeIDInProgress={setAddingTVmazeIDInProgress}
          resetAndCloseModal={resetAndCloseModal}
        />
      )}
    </>
  )
}

function SearchResults({
  results,
  owned_show_tvmaze_ids,
  addingTVmazeIDInProgress,
  setAddingTVmazeIDInProgress,
  resetAndCloseModal,
}: {
  results: ShowSearchResult[]
  owned_show_tvmaze_ids: number[]
  addingTVmazeIDInProgress: number | null
  setAddingTVmazeIDInProgress: React.Dispatch<
    React.SetStateAction<number | null>
  >
  resetAndCloseModal: () => void
}) {
  return results.map((result) => (
    <SearchResult
      result={result}
      owned_show_tvmaze_ids={owned_show_tvmaze_ids}
      resetAndCloseModal={resetAndCloseModal}
      addingTVmazeIDInProgress={addingTVmazeIDInProgress}
      setAddingTVmazeIDInProgress={setAddingTVmazeIDInProgress}
      key={result.tvmaze_id}
    />
  ))
}

function SearchResult({
  result,
  owned_show_tvmaze_ids,
  addingTVmazeIDInProgress,
  setAddingTVmazeIDInProgress,
  resetAndCloseModal,
}: {
  result: ShowSearchResult
  owned_show_tvmaze_ids: number[]
  addingTVmazeIDInProgress: number | null
  setAddingTVmazeIDInProgress: React.Dispatch<
    React.SetStateAction<number | null>
  >
  resetAndCloseModal: () => void
}) {
  async function handleAddShow(
    _: MouseEvent<HTMLButtonElement>,
    tvmaze_id: number,
  ) {
    try {
      setAddingTVmazeIDInProgress(tvmaze_id)
      const json = await addShowFromTVmazeId(tvmaze_id)
      const new_show: Show = showSchema.parse(json)
      console.log(new_show)
      resetAndCloseModal()
    } catch {
      toast("An error occurred adding this show")
    }
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
          {owned_show_tvmaze_ids.includes(result.tvmaze_id) ? (
            <div>[Already added]</div>
          ) : (
            <Button
              onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                handleAddShow(e, result.tvmaze_id)
              }
              disabled={addingTVmazeIDInProgress !== null}
            >
              {addingTVmazeIDInProgress === result.tvmaze_id
                ? "Adding..."
                : "Add this show"}
            </Button>
          )}
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
