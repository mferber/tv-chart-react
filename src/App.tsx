import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "react-hot-toast"

import { LoginPanel } from "./components/authentication/LoginPanel"
import { MainUI } from "./components/main/MainUI"
import { AppEnvironmentProvider } from "./providers/AppEnvironmentProvider"
import {
  CurrentUserStatusProvider,
  useCurrentUserStatus,
} from "./providers/CurrentUserStatusProvider"
import { setUpBackgroundRefetchFocusEvents } from "./utils/browsers"

setUpBackgroundRefetchFocusEvents()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

function App() {
  return (
    <AppEnvironmentProvider>
      <CurrentUserStatusProvider>
        <QueryClientProvider client={queryClient}>
          <AppBody />
          <Toaster position="top-right" toastOptions={{ duration: 2000 }} />
        </QueryClientProvider>
      </CurrentUserStatusProvider>
    </AppEnvironmentProvider>
  )
}

function AppBody() {
  const currentUserStatus = useCurrentUserStatus()

  function renderBody() {
    switch (currentUserStatus.authenticationStatus) {
      case "unknown":
        return "..."
      case "unauthenticated":
        return <LoginPanel />
      case "authenticated":
        return <MainUI />
    }
  }

  return renderBody()
}

export default App
