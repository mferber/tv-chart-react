import { useCurrentUserStatusContext } from "../../contexts/CurrentUserStatusContext"

export function MainUI() {
  // User can't be null or we wouldn't be here
  const currentUser = useCurrentUserStatusContext().user!
  return (
    <p>
      User logged in as: {currentUser.email} ({currentUser.id})
    </p>
  )
}
