import { useQuery } from "@tanstack/react-query"

import { useCurrentUserStatusContext } from "../../contexts/CurrentUserStatusContext"
import { LogOutLink } from "../authentication/LogOutLink"
import { fetchShows } from "../../api/client"
import { ShowDisplayList } from "./ShowDisplayList"
import { showListSchema } from "../../schemas/schemas"
import { useQueryErrorToast } from "../../hooks"

export function MainUI() {
  const showsQuery = useQuery({ queryKey: ["shows"], queryFn: fetchShows })
  useQueryErrorToast(
    showsQuery,
    "Shows could not be loaded due to a network problem",
  )

  return (
    <main className="m-4">
      <AppHeader />
      {showsQuery.error && <div>Couldn't load shows — try reloading</div>}
      {showsQuery.data && (
        <ShowDisplayList shows={showListSchema.parse(showsQuery.data)} />
      )}
    </main>
  )
}

function AppHeader() {
  // User can't be null or we wouldn't be here
  const currentUser = useCurrentUserStatusContext().user!

  return (
    <div className="flex justify-between border-b mb-4">
      <span>Add new show</span>
      <span>
        <span className="font-bold">{currentUser.email}</span> (
        <LogOutLink>Log out</LogOutLink>)
      </span>
    </div>
  )
}
