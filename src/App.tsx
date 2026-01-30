import { MainUI } from "./components/main/MainUI"
import { LoginPanel } from "./components/authentication/LoginPanel"
import { AppEnvironmentContextProvider } from "./contexts/AppEnvironmentContext"
import {
  CurrentUserStatusContextProvider,
  useCurrentUserStatusContext,
} from "./contexts/CurrentUserStatusContext"

function App() {
  return (
    <AppEnvironmentContextProvider>
      <CurrentUserStatusContextProvider>
        <AppBody />
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
