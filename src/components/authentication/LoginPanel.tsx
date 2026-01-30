import { useState, type FormEvent } from "react"
import { useCurrentUserStatusContext } from "../../contexts/CurrentUserStatusContext"
import { fetchLogin, HttpUnauthorizedError } from "../../api/client"

export function LoginPanel() {
  const currentUserStatus = useCurrentUserStatusContext()
  const [loginFailed, setLoginFailed] = useState(false)

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const login = async () => {
      try {
        const userInfo = await fetchLogin(
          formData.get("email") as string,
          formData.get("password") as string,
        )
        currentUserStatus.setCurrentUserAuthenticated(userInfo)
      } catch (error) {
        if (error instanceof HttpUnauthorizedError) {
          console.error("Login failed: unauthorized")
          setLoginFailed(true)
        } else {
          console.error("Fetch error:", e) // FIXME throw
        }
      }
    }
    login()
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        Email:{" "}
        <input name="email" type="email" defaultValue="test@example.com" />
      </div>
      <div>
        Password:{" "}
        <input name="password" type="password" defaultValue="password" />
      </div>
      <div>
        <button type="submit">Log in</button>
      </div>
      {loginFailed && <div>Login failed, try again</div>}
    </form>
  )
}
