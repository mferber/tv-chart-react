import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "react-hot-toast"

import { MainUI } from "./components/main/MainUI"
import { LoginPanel } from "./components/authentication/LoginPanel"
import { AppEnvironmentContextProvider } from "./contexts/AppEnvironmentContext"
import {
  CurrentUserStatusContextProvider,
  useCurrentUserStatusContext,
} from "./contexts/CurrentUserStatusContext"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

function App() {
  return (
    <AppEnvironmentContextProvider>
      <CurrentUserStatusContextProvider>
        <QueryClientProvider client={queryClient}>
          <AppBody />
          <Toaster />
        </QueryClientProvider>
      </CurrentUserStatusContextProvider>
    </AppEnvironmentContextProvider>
  )
}

function AppBody() {
  const currentUserStatus = useCurrentUserStatusContext()

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
