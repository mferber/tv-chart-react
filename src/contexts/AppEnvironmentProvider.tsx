import { createContext, type ReactNode, use } from "react"

import { useFetchAppEnvironment } from "../hooks"

/**
 * Hook to receive app environment
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useAppEnvironment() {
  const context = use(AppEnvironmentContext)
  if (context === undefined) {
    throw new Error(
      "useAppEnvironment must be used within AppEnvironmentProvider",
    )
  }
  return context
}

/**
 * Feature provider
 */
export function AppEnvironmentProvider({ children }: { children: ReactNode }) {
  const env = useFetchAppEnvironment()

  return <AppEnvironmentContext value={env}>{children}</AppEnvironmentContext>
}

// Context that provides the server-side app environment, obtained by a one-time request to /env in the back end.
const AppEnvironmentContext = createContext<string | null>(null)
