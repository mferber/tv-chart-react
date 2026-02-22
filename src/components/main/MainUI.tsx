import { useQuery } from "@tanstack/react-query"
import { type Dispatch, type SetStateAction, useState } from "react"

import { fetchShows } from "../../api/client"
import { useCurrentUserStatusContext } from "../../contexts/CurrentUserStatusContext"
import { useQueryErrorToast } from "../../hooks"
import { showListSchema } from "../../schemas/schemas"
import { LogOutLink } from "../authentication/LogOutLink"
import { SearchModal } from "./SearchModal"
import { ShowDisplayList } from "./ShowDisplayList"

export function MainUI() {
  const [searchUIOpen, setSearchUIOpen] = useState(false)

  const showsQuery = useQuery({ queryKey: ["shows"], queryFn: fetchShows })
  useQueryErrorToast(
    showsQuery,
    "Shows could not be loaded due to a network problem",
  )

  return (
    <main className="m-4">
      <AppHeader setSearchUIOpen={setSearchUIOpen} />
      {showsQuery.error && <div>Couldn't load shows — try reloading</div>}
      {showsQuery.data && (
        <ShowDisplayList shows={showListSchema.parse(showsQuery.data)} />
      )}
      <SearchModal isOpen={searchUIOpen} close={() => setSearchUIOpen(false)} />
    </main>
  )
}

function AppHeader({
  setSearchUIOpen,
}: {
  setSearchUIOpen: Dispatch<SetStateAction<boolean>>
}) {
  // User can't be null or we wouldn't be here
  const currentUser = useCurrentUserStatusContext().user!

  return (
    <div className="flex justify-between border-b mb-4">
      <a
        href="#"
        className="hover:text-red-800"
        onClick={() => setSearchUIOpen(true)}
      >
        Add new show
      </a>
      <span>
        <span className="font-bold">{currentUser.email}</span> (
        <LogOutLink>Log out</LogOutLink>)
      </span>
    </div>
  )
}
