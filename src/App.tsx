import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "react-hot-toast"

import { UndefinedApiBaseUrlError } from "./api/client"
import { LoginPage } from "./components/authentication/LoginPage"
import { MainUI } from "./components/main/MainUI"
import {
  AppEnvironmentProvider,
  useAppEnvironment,
} from "./providers/AppEnvironmentProvider"
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
          <Toaster />
        </QueryClientProvider>
      </CurrentUserStatusProvider>
    </AppEnvironmentProvider>
  )
}

function AppBody() {
  const environment = useAppEnvironment()
  const currentUserStatus = useCurrentUserStatus()

  function renderBody() {
    if (environment instanceof Error) {
      console.error(environment)
      if (environment instanceof UndefinedApiBaseUrlError) {
        return (
          <div>
            Sorry, the app's runtime environment is misconfigured right now. See
            console for details.
          </div>
        )
      } else {
        return (
          <div>
            Sorry, the app was unable to start for unknown reasons. See console
            for details.
          </div>
        )
      }
    }
    switch (currentUserStatus.authenticationStatus) {
      case "unknown":
        return null // leave page blank till we've fetched the env or failed at it
      case "unauthenticated":
        return <LoginPage />
      case "authenticated":
        return <MainUI />
    }
  }

  return renderBody()
}

export default App
