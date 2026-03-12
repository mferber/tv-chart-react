// Context that provides the user's authentication status (unknown, unauthenticated, or authenticated)
// and, if authenticated, the user info (email and id).

import { createContext, type ReactNode, use, useEffect, useState } from "react"

import { fetchCurrentUser, HttpUnauthorizedError } from "../api/client"

// User identification

export interface User {
  email: string
  id: string
}

type AuthenticationStatusType = "unknown" | "unauthenticated" | "authenticated"

/**
 * Hook to receive current user status
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useCurrentUserStatus() {
  const context = use(CurrentUserStatusContext)
  if (context === undefined) {
    throw new Error(
      "useCurrentUserStatus must be used within CurrentUserStatusProvider",
    )
  }
  return context
}

/**
 * Feature provider
 */
export function CurrentUserStatusProvider({
  children,
}: {
  children: ReactNode
}) {
  const [status, setStatus] = useState<AuthenticationStatusType>("unknown")
  const [user, setUser] = useState<User | null>(null)

  // on first load, check for still-authenticated user
  useEffect(() => {
    const checker = async () => {
      const [updStatus, updUser] = await checkCurrentUserStatus()
      setStatus(updStatus)
      setUser(updUser)
    }
    checker()
  }, [])

  return (
    <CurrentUserStatusContext
      value={{
        authenticationStatus: status,
        user: user,
        setCurrentUserAuthenticated: (user) => {
          setStatus("authenticated")
          setUser(user)
        },
        setCurrentUserUnauthenticated: () => {
          setStatus("unauthenticated")
          setUser(null)
        },
        setCurrentUserUnknown: () => {
          setStatus("unknown")
          setUser(null)
        },
      }}
    >
      {children}
    </CurrentUserStatusContext>
  )
}

// Context

// Expose current user status and setters for updating it
interface CurrentUserStatusContextType {
  authenticationStatus: AuthenticationStatusType
  user: User | null
  setCurrentUserAuthenticated: (user: User) => void
  setCurrentUserUnauthenticated: () => void
  setCurrentUserUnknown: () => void
}

const CurrentUserStatusContext = createContext<CurrentUserStatusContextType>(
  {} as CurrentUserStatusContextType,
)

// App startup check: ask server for currently authenticated user, in case we have a valid JWT
// cookie lying around
async function checkCurrentUserStatus(): Promise<
  [AuthenticationStatusType, User | null]
> {
  try {
    const user = await fetchCurrentUser()
    return ["authenticated", user]
  } catch (e) {
    if (e instanceof HttpUnauthorizedError) {
      return ["unauthenticated", null]
    } else {
      console.error(e)
      return ["unknown", null]
    }
  }
}
