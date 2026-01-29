import {
  useCurrentUserContext,
  type User,
} from "../../contexts/CurrentUserContext"

export function MainUI() {
  // User can't be null or we wouldn't be here
  const { currentUser } = useCurrentUserContext() as { currentUser: User }
  return (
    <p>
      User logged in as: {currentUser.email} ({currentUser.id})
    </p>
  )
}
