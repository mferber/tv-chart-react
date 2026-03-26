import { type UseQueryResult } from "@tanstack/react-query"
import { useEffect, useState } from "react"

import { apiFetch } from "./api/client"
import { errorToast } from "./utils/toasts"

// Hook: fetches server-side app environment identifier; if run at app startup, also initializes CSRF token
export function useFetchAppEnvironment(): string | null | Error {
  const [appEnvironment, setAppEnvironment] = useState<string | null | Error>(
    null,
  )

  useEffect(() => {
    const fetchEnv = async () => {
      try {
        const env = await (await apiFetch("/env")).text()
        setAppEnvironment(env)
      } catch (e) {
        console.error(e)
        if (e instanceof Error) {
          setAppEnvironment(e)
        } else {
          console.error(
            "Something unknown went very wrong fetching the app environment",
          )
        }
      }
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
    errorToast(message)
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
