import { type MouseEvent, type ReactNode } from "react"
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
      throw e
    }
  }

  return (
    <a href="#" onClick={logOut}>
      {children}
    </a>
  )
}
