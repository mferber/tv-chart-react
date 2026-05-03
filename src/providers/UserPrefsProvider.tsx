import React, { type ReactNode, use, useEffect, useState } from "react"

import { fetchUserPrefs, updateUserPrefs } from "../api/client"
import type { UserPrefs } from "../types/schemas"
import { errorToast } from "../utils/toasts"

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

  async function update(newPrefs: UserPrefs) {
    // FIXME push to server as well
    setUserPrefs(newPrefs)

    // set-and-forget update: we don't care if it succeeds or fails, since we want the
    // favorites feature to keep working in the client regardless (it should show an
    // error toast if an error occurs though)
    try {
      await updateUserPrefs(newPrefs)
    } catch {
      errorToast("An error occurred updating user preferences")
    }
  }

  useEffect(() => {
    const action = async () => {
      try {
        const fetchedPrefs = await fetchUserPrefs()
        setUserPrefs(fetchedPrefs)
      } catch {
        errorToast("An error occurred fetching user preferences")
        setUserPrefs({ show_favorites_only: false })
      }
    }
    action()
  }, [])

  const value: UserPrefsContextType = {
    userPrefs: userPrefs,
    updateUserPrefs: update,
  }
  return <UserPrefsContext value={value}>{children}</UserPrefsContext>
}

type UserPrefsContextType = {
  userPrefs: UserPrefs | null
  updateUserPrefs: (prefs: UserPrefs) => void
}
const UserPrefsContext = React.createContext<UserPrefsContextType | null>(null)
