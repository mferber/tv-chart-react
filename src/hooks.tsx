import { type UseQueryResult } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

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

/**
 * Simple hook for running a one-time query
 * @param queryFn function to run when `executeQuery` is called
 */
export function useSimpleQuery<T, Args extends unknown[]>(
  queryFn: (...args: Args) => T | Promise<T>,
) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<unknown | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const executeQuery = async (...args: Args) => {
    try {
      resetQuery()
      setIsLoading(true)
      setData(await queryFn(...args))
    } catch (e) {
      setError(e)
    } finally {
      setIsLoading(false)
    }
  }

  const resetQuery = () => {
    setData(null)
    setError(null)
    setIsLoading(false)
  }

  return { executeQuery, resetQuery, data, error, isLoading }
}
