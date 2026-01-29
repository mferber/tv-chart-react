import { MainUI } from "./components/main/MainUI"
import { LoginPanel } from "./components/authentication/LoginPanel"
import { AppEnvironmentContextProvider } from "./contexts/AppEnvironmentContext"
import {
  CurrentUserContextProvider,
  useCurrentUserContext,
} from "./contexts/CurrentUserContext"

function App() {
  return (
    <AppEnvironmentContextProvider>
      <CurrentUserContextProvider>
        <AppBody />
      </CurrentUserContextProvider>
    </AppEnvironmentContextProvider>
  )
}

function AppBody() {
  const { currentUser } = useCurrentUserContext()

  return currentUser === null ? <LoginPanel /> : <MainUI />
}

export default App
