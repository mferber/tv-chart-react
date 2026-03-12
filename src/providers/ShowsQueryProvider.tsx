import { useQuery, type UseQueryResult } from "@tanstack/react-query"
import React, { type ReactNode, use } from "react"

import { fetchShows } from "../api/client"
import { useQueryErrorToast } from "../hooks"
import { type ShowRecord } from "../types/schemas"

/**
 * Hook to access the query object
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useShowsQuery() {
  const value = use(ShowsQueryContext)
  if (!value) {
    throw new Error("useShowsQuery must be used within ShowsQueryProvider")
  }
  return value
}

/**
 * Feature provider
 */
export function ShowsQueryProvider({ children }: { children: ReactNode }) {
  const showsQuery = useQuery({
    queryKey: ["shows"],
    queryFn: async () => {
      return await fetchShows()
    },
  })

  useQueryErrorToast(
    showsQuery,
    "Shows could not be loaded due to a network problem",
  )

  return <ShowsQueryContext value={showsQuery}>{children}</ShowsQueryContext>
}

type ShowsQueryResultType = UseQueryResult<ShowRecord, Error>
const ShowsQueryContext = React.createContext<ShowsQueryResultType | null>(null)
