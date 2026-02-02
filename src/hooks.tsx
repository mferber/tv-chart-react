import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { type UseQueryResult } from "@tanstack/react-query"

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

// Hook: checks for a React Query query error, logs it, and displays a message
export function useQueryErrorToast<T>(
  queryResult: UseQueryResult<T, Error>,
  message: string,
): void {
  useEffect(() => {
    if (!queryResult.error) {
      return
    }
    console.error(queryResult.error)
    toast(message)
  }, [queryResult.error, message])
}
