import { useQueryClient } from "@tanstack/react-query"
import { type MouseEvent, type ReactNode } from "react"
import toast from "react-hot-toast"

import { fetchLogout } from "../../api/client"
import { useCurrentUserStatus } from "../../providers/CurrentUserStatusProvider"

export function LogOutLink({ children }: { children: ReactNode }) {
  const currentStatusContext = useCurrentUserStatus()
  const queryClient = useQueryClient()

  const logOut = async (evt: MouseEvent<HTMLElement>) => {
    evt.preventDefault()
    try {
      await fetchLogout()
      currentStatusContext.setCurrentUserUnauthenticated()
      queryClient.removeQueries()
    } catch (e) {
      console.error(e)
      toast(
        "Logout couldn't be completed due to a network problem; try again later",
      )
    }
  }

  return <div onClick={logOut}>{children}</div>
}
