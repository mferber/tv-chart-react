import { useState } from "react"

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
