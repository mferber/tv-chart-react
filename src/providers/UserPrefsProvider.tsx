import React, { type ReactNode, use, useEffect, useState } from "react"

import type { UserPrefs } from "../types/schemas"

/**
 * Hook to access and update preferences
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useUserPrefs(): UserPrefsContextType {
  const value = use(UserPrefsContext)
  if (!value) {
    throw new Error("useUserPrefs must be used within UserPrefsProvider")
  }
  return value
}

/**
 * Feature provider
 */
export function UserPrefsProvider({ children }: { children: ReactNode }) {
  const [userPrefs, setUserPrefs] = useState<UserPrefs | null>(null)

  // FIXME: replace this with a fetch from server; set prefs to defaults on error
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUserPrefs({ show_favorites_only: false })
  }, [])

  const value: UserPrefsContextType = {
    userPrefs: userPrefs,
    updateUserPrefs: (prefs: UserPrefs) => setUserPrefs(prefs),
  }
  return <UserPrefsContext value={value}>{children}</UserPrefsContext>
}

type UserPrefsContextType = {
  userPrefs: UserPrefs | null
  updateUserPrefs: (prefs: UserPrefs) => void
}
const UserPrefsContext = React.createContext<UserPrefsContextType | null>(null)
