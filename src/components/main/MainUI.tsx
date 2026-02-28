import { useQuery } from "@tanstack/react-query"
import { type Dispatch, type SetStateAction, useState } from "react"
import { ThreeDots } from "react-loader-spinner"

import { fetchShows } from "../../api/client"
import { useCurrentUserStatusContext } from "../../contexts/CurrentUserStatusContext"
import { useQueryErrorToast } from "../../hooks"
import { showMapSchema } from "../../schemas/schemas"
import { LogOutLink } from "../authentication/LogOutLink"
import { SearchModal } from "./SearchModal"
import { ShowDisplayList } from "./ShowDisplayList"

export function MainUI() {
  const [searchUIOpen, setSearchUIOpen] = useState(false)

  const showsQuery = useQuery({
    queryKey: ["shows"],
    queryFn: async () => {
      const fetch_results = await fetchShows()
      return showMapSchema.parse(fetch_results)
    },
  })

  useQueryErrorToast(
    showsQuery,
    "Shows could not be loaded due to a network problem",
  )

  return (
    <main className="m-4">
      <AppHeader
        setSearchUIOpen={setSearchUIOpen}
        refetch={showsQuery.refetch}
        isRefetching={showsQuery.isRefetching}
      />
      {showsQuery.data && <ShowDisplayList shows={showsQuery.data} />}
      {showsQuery.error && <div>Couldn't load shows — try reloading</div>}
      {showsQuery.isPending && <div>Loading...</div>}
      <SearchModal
        isOpen={searchUIOpen}
        close={() => setSearchUIOpen(false)}
        shows={showsQuery.data}
      />
    </main>
  )
}

function AppHeader({
  setSearchUIOpen,
  refetch,
  isRefetching,
}: {
  setSearchUIOpen: Dispatch<SetStateAction<boolean>>
  refetch: () => void
  isRefetching: boolean
}) {
  // User can't be null or we wouldn't be here
  const currentUser = useCurrentUserStatusContext().user!

  return (
    <div className="flex justify-between border-b mb-4 align-middle">
      <span className="flex gap-4 items-baseline">
        <a
          href="#"
          className="hover:text-red-800"
          onClick={() => setSearchUIOpen(true)}
        >
          Add new show
        </a>
        <span className="flex items-center gap-2">
          <a href="#" className="hover:text-red-800" onClick={() => refetch()}>
            Refresh
          </a>
          {isRefetching && (
            <ThreeDots height="10" wrapperClass="w-4 h-3" color="black" />
          )}
        </span>
      </span>
      <span>
        <span className="font-bold">{currentUser.email}</span> (
        <LogOutLink>Log out</LogOutLink>)
      </span>
    </div>
  )
}
