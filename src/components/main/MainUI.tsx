import { useCurrentUserStatusContext } from "../../contexts/CurrentUserStatusContext"
import { LogOutLink } from "../authentication/LogOutLink"

export function MainUI() {
  // User can't be null or we wouldn't be here
  const currentUser = useCurrentUserStatusContext().user!
  return (
    <>
      <div>
        <span className="font-bold">{currentUser.email}</span> (
        <LogOutLink>Log out</LogOutLink>)
      </div>
      <hr />
    </>
  )
}
