import { createContext, use, type ReactNode } from "react"
import { useFetchAppEnvironment, type AppEnvironmentType } from "../hooks"

// Context that provides the app environment, consisting of the current environment name
// ("development" or "production") and the CSRF protection token. Both are obtained by
// a one-time request to /env in the back end.

// eslint-disable-next-line react-refresh/only-export-components
export const AppEnvironmentContext = createContext<AppEnvironmentType | null>(
  null,
)

// Provides the app environment context; also carries out initial request to server
// to find out the environment and get a CSRF protection cookie
export function AppEnvironmentContextProvider({
  children,
}: {
  children: ReactNode
}) {
  const env = useFetchAppEnvironment()

  return <AppEnvironmentContext value={env}>{children}</AppEnvironmentContext>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAppEnvironmentContext() {
  const context = use(AppEnvironmentContext)
  if (context === undefined) {
    throw new Error(
      "useAppEnvironmentContext must be used within AppEnvironmentContextProvider",
    )
  }
  return context
}
