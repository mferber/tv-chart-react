import { type MouseEvent, type ReactNode } from "react"
import toast from "react-hot-toast"

import { useCurrentUserStatusContext } from "../../contexts/CurrentUserStatusContext"
import { fetchLogout } from "../../api/client"

export function LogOutLink({ children }: { children: ReactNode }) {
  const currentStatusContext = useCurrentUserStatusContext()

  const logOut = async (evt: MouseEvent<HTMLAnchorElement>) => {
    evt.preventDefault()
    try {
      await fetchLogout()
      currentStatusContext.setCurrentUserUnauthenticated()
    } catch (e) {
      console.error(e)
      toast(
        "Logout couldn't be completed due to a network problem; try again later",
      )
    }
  }

  return (
    <a href="#" onClick={logOut}>
      {children}
    </a>
  )
}
