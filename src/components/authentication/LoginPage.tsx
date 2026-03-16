import { type FormEvent, useState } from "react"
import toast from "react-hot-toast"

import { fetchLogin, HttpUnauthorizedError } from "../../api/client"
import howItWorks_Narrow from "../../assets/how-it-works-narrow.png"
import howItWorks_Wide from "../../assets/how-it-works-wide.png"
import { useCurrentUserStatus } from "../../providers/CurrentUserStatusProvider"
import { Button } from "../misc/Button"

export function LoginPage() {
  const currentUserStatus = useCurrentUserStatus()
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
          console.error(error)
          toast(
            "Login could not be completed due to a network problem; try again later",
          )
        }
      }
    }
    login()
  }

  return (
    <main className="flex flex-col items-center mt-16 px-8">
      <header className="text-5xl text-center font-bold mb-5">
        Couch Potato
      </header>
      <header className="text-3xl text-center mb-10">
        An app for tracking your TV watching progress
      </header>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 items-center">
          <label className="text-right font-medium">Email address</label>
          <input
            className="border rounded px-3 py-2"
            name="email"
            type="email"
            defaultValue="test@example.com"
          />

          <label className="text-right font-medium">Password</label>
          <input
            className="border rounded px-3 py-2"
            name="password"
            type="password"
            defaultValue="password"
          />

          <div />
          <Button htmlType="submit">Log in</Button>

          <div />
          <a href="#" className="underline text-red-800 hover:text-red-950">
            Sign up for a new account
          </a>
        </div>
        <div></div>
        {loginFailed && <div>Login failed, try again</div>}
      </form>

      <div className="flex flex-col items-center mt-6 mb-10 rounded-xl border-gray-200 border shadow-2xl">
        <div className="text-xl font-bold mt-8 mb-0">How it works:</div>
        <img src={howItWorks_Wide} className="w-200 p-4 hidden md:block" />
        <img src={howItWorks_Narrow} className="w-100 p-4 md:hidden" />
      </div>
    </main>
  )
}
