import { type MouseEvent, type ReactNode } from "react"
import { useCurrentUserStatusContext } from "../../contexts/CurrentUserStatusContext"

export function LogOutLink({ children }: { children: ReactNode }) {
  const currentStatusContext = useCurrentUserStatusContext()

  const logOut = (evt: MouseEvent<HTMLAnchorElement>) => {
    evt.preventDefault()
    // FIXME insert call to /logout endpoint (to be built) that unsets the cookie
    currentStatusContext.setCurrentUserUnauthenticated()
  }

  return (
    <a href="#" onClick={logOut}>
      {children}
    </a>
  )
}
