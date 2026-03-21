import { type SyntheticEvent, useState } from "react"

import {
  fetchLogin,
  fetchRegisterUser,
  HttpConflictError,
  HttpUnauthorizedError,
} from "../../api/client"
import Couch from "../../assets/couch.svg?react"
import howItWorks_Narrow from "../../assets/how-it-works-narrow.png"
import howItWorks_Wide from "../../assets/how-it-works-wide.png"
import tvmazeLogo from "../../assets/tvmaze-logo.png"
import { useCurrentUserStatus } from "../../providers/CurrentUserStatusProvider"
import { errorToast } from "../../utils/toasts"
import { Button } from "../misc/Button"

export function LoginPage() {
  const [isRegisteringNewUser, setIsRegisteringNewUser] = useState(false)

  return (
    <main className="flex flex-col items-center mt-16 px-8">
      <header className="text-5xl text-center font-bold mb-5">
        Couch Potato
      </header>
      <div>
        <Couch className="w-24 h-12 mb-4" />
      </div>
      <header className="text-2xl text-center mb-4">
        An app for tracking your TV watching progress
      </header>

      {isRegisteringNewUser ? (
        <RegistrationForm
          switchToLoginForm={() => setIsRegisteringNewUser(false)}
        />
      ) : (
        <LoginForm
          switchToRegistrationForm={() => setIsRegisteringNewUser(true)}
        />
      )}

      <div className="mb-10 text-center text-sm">
        <div>&copy; {new Date().getFullYear()} by Matthias Ferber</div>
        <div>
          Powered by{" "}
          <a href="https://www.tvmaze.com">
            <img src={tvmazeLogo} alt="TVmaze" className="w-16 inline" />
          </a>
        </div>
      </div>
    </main>
  )
}

function LoginForm({
  switchToRegistrationForm,
}: {
  switchToRegistrationForm: () => void
}) {
  const [loginFailed, setLoginFailed] = useState(false)
  const currentUserStatus = useCurrentUserStatus()

  function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
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
        console.error(error)
        if (error instanceof HttpUnauthorizedError) {
          setLoginFailed(true)
        } else {
          errorToast(
            "Login could not be completed due to a network problem; try again later",
          )
        }
      }
    }
    login()
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 items-center justify-items-start">
          <label className="font-medium">Email address</label>
          <input
            className="w-64 border rounded px-3 py-2"
            name="email"
            type="email"
            defaultValue="test@example.com"
          />

          <label className="font-medium">Password</label>
          <input
            className="w-64 border rounded px-3 py-2"
            name="password"
            type="password"
            defaultValue="password"
          />

          {loginFailed && (
            <>
              <div />
              <div className="text-red-800">Login failed, try again</div>
            </>
          )}

          <div />
          <Button htmlType="submit">Log in</Button>

          <div />
          <a
            href="#"
            className="underline text-red-800 hover:text-red-950"
            onClick={(e) => {
              e.preventDefault()
              switchToRegistrationForm()
            }}
          >
            Sign up for a new account
          </a>
        </div>
      </form>

      <div className="flex flex-col items-center mt-6 mb-10 rounded-xl border-gray-200 border shadow-2xl">
        <div className="text-xl font-bold mt-8 mb-0">How it works:</div>

        {/* load the appropriately sized instructional image for the screen dimensions */}
        <picture>
          <source media="(max-width: 40rem)" srcSet={howItWorks_Narrow} />
          <img
            loading="lazy"
            src={howItWorks_Wide}
            alt="Instructional diagram"
            className="p-4 w-100 sm:w-200"
          />
        </picture>
      </div>
    </>
  )
}

function RegistrationForm({
  switchToLoginForm,
}: {
  switchToLoginForm: () => void
}) {
  const [registrationFailedMessage, setRegistrationFailedMessage] = useState<
    string | null
  >(null)
  const currentUserStatus = useCurrentUserStatus()

  function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    if (formData.get("password") !== formData.get("password2")) {
      setRegistrationFailedMessage("Passwords don't match, try again")
      return
    } else {
      setRegistrationFailedMessage(null)
    }

    const register = async () => {
      const email = formData.get("email") as string
      const password = formData.get("password") as string

      try {
        await fetchRegisterUser(email, password)
      } catch (error) {
        console.error(error)
        if (error instanceof HttpConflictError) {
          setRegistrationFailedMessage(
            "That email address is in use, try another",
          )
        } else {
          errorToast(
            "Registration could not be completed due to a network problem; try again later",
          )
        }
        return
      }

      // registration succeeded, now log the user in
      try {
        const userInfo = await fetchLogin(email, password)
        currentUserStatus.setCurrentUserAuthenticated(userInfo)
      } catch (error) {
        console.error(error)
        if (error instanceof HttpUnauthorizedError) {
          switchToLoginForm()
          errorToast(
            "Registration succeeded, but login failed for unknown reason; try again",
          )
        } else {
          errorToast(
            "Login could not be completed due to a network problem; try again later",
          )
        }
      }
    }
    register()
  }

  return (
    <>
      <div className="text-xl mb-4">Register for an account</div>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 items-center justify-items-start">
          <label className="font-medium">Email address</label>
          <input
            className="w-64 border rounded px-3 py-2"
            name="email"
            type="email"
            defaultValue="test@example.com"
          />

          <label className="font-medium">Password</label>
          <input
            className="w-64 border rounded px-3 py-2"
            name="password"
            type="password"
            defaultValue="password"
          />

          <label className="font-medium">Reenter password</label>
          <input
            className="w-64 border rounded px-3 py-2"
            name="password2"
            type="password"
            defaultValue="password"
          />

          {registrationFailedMessage && (
            <>
              <div />
              <div className="w-64 text-red-800">
                {registrationFailedMessage}
              </div>
            </>
          )}
          <div />
          <Button htmlType="submit">Register</Button>

          <div />
          <a
            href="#"
            className="underline text-red-800 hover:text-red-950"
            onClick={(e) => {
              e.preventDefault()
              switchToLoginForm()
            }}
          >
            Back to login form
          </a>
        </div>
        <div></div>
      </form>
    </>
  )
}
