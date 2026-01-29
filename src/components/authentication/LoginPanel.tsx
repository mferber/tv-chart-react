import { useCurrentUserContext } from "../../contexts/CurrentUserContext"

export function LoginPanel() {
  const { setCurrentUser } = useCurrentUserContext()
  return (
    <div>
      <button
        onClick={() =>
          setCurrentUser({ email: "nobody@nowhere.com", id: "123abc" })
        }
      >
        Fake login
      </button>
    </div>
  )
}
