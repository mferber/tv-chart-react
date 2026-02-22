import { useQuery } from "@tanstack/react-query"
import { type SubmitEvent, useState } from "react"
import Modal from "react-modal"

import { fetchShowSearchResults } from "../../api/client"
import {
  type ShowSearchResult,
  showSearchResultsSchema,
} from "../../schemas/schemas"
import { ImageWithPlaceholder } from "../misc/ImageWithPlaceholder"

export function SearchModal({
  isOpen,
  close,
}: {
  isOpen: boolean
  close: () => void
}) {
  const [searchTerm, setSearchTerm] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["show-search", searchTerm],
    queryFn: async () => {
      console.log("FETCH:", searchTerm)
      try {
        const fetchResults = await fetchShowSearchResults(searchTerm)
        console.log(JSON.stringify(fetchResults, null, 2))
        return showSearchResultsSchema.parse(fetchResults)
      } catch (e) {
        console.error(e)
      }
    },
    enabled: searchTerm != "",
  })

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    console.log("SUBMIT")
    const formData = new FormData(e.target)
    const q = (formData.get("query") ?? "").toString()
    setSearchTerm(q)
  }

  return (
    <Modal
      isOpen={isOpen}
      overlayClassName="fixed top-0 right-0 bottom-0 left-0 bg-black/25"
      className="absolute top-8 right-8 bottom-8 left-8 p-4 border-4 rounded-xl bg-white outline-0 overflow-auto"
    >
      <div className="text-right">
        <a
          href="#"
          onClick={() => {
            setSearchTerm("")
            close()
          }}
        >
          Cancel
        </a>
      </div>
      <div>Search for a show here:</div>
      <div>
        <form onSubmit={handleSubmit} className="flex gap-1">
          <input
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
      {data && data.results && <SearchResults results={data.results} />}
    </Modal>
  )
}

function SearchResults({ results }: { results: ShowSearchResult[] }) {
  return results.map((result) => (
    <div className="mt-8 flex" key={result.tvmaze_id}>
      <ImageWithPlaceholder
        src={result.image_sm_url ?? ""}
        alt={result.name}
        widthClassName="w-32"
        placeholderHeightClassName="h-50"
        additionalClassNames="mr-4 mb-4"
      />
      {/* <img
        className="w-32 mr-4 mb-4"
        src={result.image_sm_url ?? ""}
      /> */}
      <div>
        <button className="bg-red-800 text-white py-1 px-2 rounded-lg mb-2">
          Add this show
        </button>
        <div className="text-2xl font-bold">{result.name}</div>
        <Details result={result} />
        <div
          className="mt-2 text-sm"
          // html is pre-sanitized on the backend
          // eslint-disable-next-line react-dom/no-dangerously-set-innerhtml
          dangerouslySetInnerHTML={{
            __html: result.summary_html ?? "(no summary available)",
          }}
        />
      </div>
    </div>
  ))
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
    <div className="italic">{result.genres.join(", ")}</div>
  ) : null

  return (
    <>
      {dates_and_sources_div}
      {genres_div}
    </>
  )
}
