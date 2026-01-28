import { createContext, useState, use, type Dispatch, type SetStateAction, type ReactNode } from 'react'

// Context that provides the email and id of the current user, if one is logged in, otherwise null.

export interface User {
  email: string
  id: string
}

interface CurrentUserContextType {
  currentUser: User | null
  setCurrentUser: Dispatch<SetStateAction<User | null>>
}

// eslint-disable-next-line react-refresh/only-export-components
export const CurrentUserContext = createContext<CurrentUserContextType>({} as CurrentUserContextType)

export function CurrentUserContextProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  return (
    <CurrentUserContext value={{ currentUser, setCurrentUser }}>
      {children}
    </CurrentUserContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCurrentUserContext(): CurrentUserContextType {
  const context = use(CurrentUserContext);
  if (context === undefined) {
    throw new Error('useCurrentUserContext must be used within CurrentUserContextProvider');
  }
  return context;
}