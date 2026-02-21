import { useQuery } from "@tanstack/react-query"

import { useCurrentUserStatusContext } from "../../contexts/CurrentUserStatusContext"
import { LogOutLink } from "../authentication/LogOutLink"
import { fetchShows } from "../../api/client"
import { ShowDisplayList } from "./ShowDisplayList"
import { showListSchema } from "../../schemas/schemas"
import { useQueryErrorToast } from "../../hooks"

export function MainUI() {
  // User can't be null or we wouldn't be here
  const currentUser = useCurrentUserStatusContext().user!

  const showsQuery = useQuery({ queryKey: ["shows"], queryFn: fetchShows })
  useQueryErrorToast(
    showsQuery,
    "Shows could not be loaded due to a network problem",
  )

  return (
    <main className="m-4">
      <div className="border-b-1 pb-1 mb-4">
        <span className="font-bold">{currentUser.email}</span> (
        <LogOutLink>Log out</LogOutLink>)
      </div>

      {showsQuery.error && <div>Couldn't load shows — try reloading</div>}
      {showsQuery.data && (
        <ShowDisplayList shows={showListSchema.parse(showsQuery.data)} />
      )}
    </main>
  )
}
