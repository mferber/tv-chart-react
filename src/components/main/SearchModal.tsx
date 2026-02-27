import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  createContext,
  type RefObject,
  type SubmitEvent,
  use,
  useRef,
  useState,
} from "react"
import { toast } from "react-hot-toast"
import Modal from "react-modal"

import { addShowFromTVmazeId, fetchShowSearchResults } from "../../api/client"
import { Button } from "../../components/misc/Button"
import { useSimpleQuery } from "../../hooks"
import {
  type Show,
  type ShowSearchResult,
  showSearchResultsSchema,
} from "../../schemas/schemas"
import { ImageWithPlaceholder } from "../misc/ImageWithPlaceholder"

interface SearchModalContextType {
  shows: Show[]
  isSearchResultLoading: boolean
  tvMazeIdBeingAdded: number | null
  fn_executeSearch: (query: string) => void
  fn_setTVmazeIdBeingAdded: (value: number | null) => void
  fn_resetAndCloseModal: () => void
}

/**
 * Search model context defines:
 * - `shows`: list of shows we're already tracking, so we know which ones we can't
 *    add again
 * - `isSearchResultLoading`: true if search results are being loaded
 * - `tvMazeIdBeingAdded`: if a show is currently being added, its TVmaze id, else null
 * - `fn_executeSearch`: function that will search on the provided query term
 * - `fn_setTVmazeIdBeingAdded`: sets the TVmaze id of a show being added
 * - `fn_resetAndCloseModal`: function; clears and dismisses the Search modal
 */
const SearchModalContext = createContext<SearchModalContextType>({
  shows: [],
  isSearchResultLoading: false,
  tvMazeIdBeingAdded: null,
  fn_executeSearch: (_) => {}, // eslint-disable-line @typescript-eslint/no-unused-vars
  fn_setTVmazeIdBeingAdded: (_) => {}, // eslint-disable-line @typescript-eslint/no-unused-vars
  fn_resetAndCloseModal: () => {},
})

/**
 * Container for the search modal. Note that `ModalContent` will not render unless the
 * modal is actually open.
 *
 * Props:
 *   - `isOpen`: true to cause the modal to open
 *   - `close`: function that will set isOpen to false and close the modal
 *   - `shows`: the user's current list of shows
 */
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

  return (
    <Modal
      isOpen={isOpen}
      onAfterOpen={() => searchFieldRef.current?.focus()}
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

/**
 * Main content of the modal.
 *
 * Props:
 *   - `searchFieldRef`: a ref to be attached to the search query input field; it will
 *     be given default focus
 *   - `close`: function that will close the model
 *   - `shows`: the user's current list of shows
 */
function ModalContent({
  searchFieldRef,
  close,
  shows,
}: {
  searchFieldRef: RefObject<HTMLInputElement | null>
  close: () => void
  shows: Show[] | undefined
}) {
  const [tvMazeIdBeingAdded, setTVmazeIdBeingAdded] = useState<number | null>(
    null,
  )

  // Main search query
  const { executeQuery, resetQuery, data, isLoading } = useSimpleQuery(
    async (searchTerm: string) => {
      const fetchResults = await fetchShowSearchResults(searchTerm)
      return showSearchResultsSchema.parse(fetchResults)
    },
  )

  // Function that will both reset the form and close the modal
  function resetAndCloseModal() {
    resetQuery()
    close()
  }

  return (
    <SearchModalContext
      value={{
        shows: shows || [],
        isSearchResultLoading: isLoading,
        tvMazeIdBeingAdded: tvMazeIdBeingAdded,
        fn_executeSearch: executeQuery,
        fn_setTVmazeIdBeingAdded: setTVmazeIdBeingAdded,
        fn_resetAndCloseModal: resetAndCloseModal,
      }}
    >
      <CancelWidget />
      <SearchForm searchFieldRef={searchFieldRef} />

      {/* FIXME: better loading placeholder */}
      {isLoading && "…"}

      {data && data.results && <SearchResults results={data.results} />}
    </SearchModalContext>
  )
}

/**
 * Widget for canceling the "Add show" operation.
 */
function CancelWidget() {
  const { fn_resetAndCloseModal } = use(SearchModalContext)

  return (
    <div className="text-right">
      <a href="#" onClick={() => fn_resetAndCloseModal()}>
        Cancel
      </a>
    </div>
  )
}

/**
 * The search form.
 */
function SearchForm({
  searchFieldRef,
}: {
  searchFieldRef: RefObject<HTMLInputElement | null>
}) {
  const { fn_executeSearch, isSearchResultLoading, tvMazeIdBeingAdded } =
    use(SearchModalContext)

  // Search click handler: executes query
  function handleSubmitSearch(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.target)
    const q = (formData.get("query") ?? "").toString()
    fn_executeSearch(q)
  }

  return (
    <>
      <div>Search for a show here:</div>
      <div>
        <form onSubmit={handleSubmitSearch} className="flex gap-1">
          <input
            ref={searchFieldRef}
            type="text"
            name="query"
            className="flex-1 max-w-80 min-w-8 px-2 py-1 border rounded-md"
          />
          <Button
            htmlType="submit"
            disabled={isSearchResultLoading || tvMazeIdBeingAdded !== null}
          >
            Search
          </Button>
        </form>
      </div>
    </>
  )
}

/**
 * Search results display.
 */
function SearchResults({ results }: { results: ShowSearchResult[] }) {
  return results.map((result) => (
    <SearchResult result={result} key={result.tvmaze_id} />
  ))
}

/**
 * A single search result.
 */
function SearchResult({ result }: { result: ShowSearchResult }) {
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
          <AddThisShowButton result={result} />
          <Details result={result} />

          {/* show summary for larger screens */}
          <Summary result={result} className="mt-2 text-sm hidden sm:block" />
        </div>
      </div>

      {/* show summary for smaller screens */}
      <Summary result={result} className="text-sm block sm:hidden" />
    </div>
  )
}

function AddThisShowButton({ result }: { result: ShowSearchResult }) {
  const {
    shows,
    tvMazeIdBeingAdded,
    fn_setTVmazeIdBeingAdded,
    fn_resetAndCloseModal,
  } = use(SearchModalContext)

  const queryClient = useQueryClient()
  const addShowMutation = useMutation({
    mutationFn: (tvmaze_id: number) => {
      fn_setTVmazeIdBeingAdded(tvmaze_id)
      return addShowFromTVmazeId(tvmaze_id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shows"] })
      fn_resetAndCloseModal()
    },
    onError: (e: Error) => {
      console.error(e)
      toast("An error occurred adding this show")
      fn_setTVmazeIdBeingAdded(null)
    },
  })

  return shows.some((s) => s.tvmaze_id === result.tvmaze_id) ? (
    <Button htmlType="button" disabled={true}>
      Already tracked
    </Button>
  ) : (
    <Button
      htmlType="button"
      onClick={() => addShowMutation.mutate(result.tvmaze_id)}
      disabled={tvMazeIdBeingAdded !== null}
      spinner={tvMazeIdBeingAdded === result.tvmaze_id}
    >
      Add this show
    </Button>
  )
}

/**
 * Basic details about the show: years, source, etc.
 */
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
    <>
      <div className="text-2xl font-bold mb-1">{result.name}</div>
      <div className="mb-2 sm:mb-2">
        {dates_and_sources_div}
        {genres_div}
      </div>
    </>
  )
}

function Summary({
  result,
  className,
}: {
  result: ShowSearchResult
  className: string
}) {
  return (
    <div
      className={className}
      // summary is pre-sanitized on the backend
      // eslint-disable-next-line react-dom/no-dangerously-set-innerhtml
      dangerouslySetInnerHTML={{
        __html: result.summary_html ?? "(no summary available)",
      }}
    />
  )
}
