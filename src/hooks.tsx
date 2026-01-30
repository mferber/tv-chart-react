import { useEffect, useState } from "react"

// Hook: fetches server-side app environment identifier; if run at app startup, also initializes CSRF token
export function useFetchAppEnvironment(): string | null {
  const [appEnvironment, setAppEnvironment] = useState<string | null>(null)

  useEffect(() => {
    const fetchEnv = async () => {
      setAppEnvironment(await (await fetch("/api/env")).text())
    }
    fetchEnv()
  }, [])

  return appEnvironment
}
