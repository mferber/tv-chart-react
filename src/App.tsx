import {
  AppEnvironmentContextProvider,
  useAppEnvironmentContext,
} from "./contexts/AppEnvironmentContext"
import { CurrentUserContextProvider, useCurrentUserContext, type User } from "./contexts/CurrentUserContext"

function App() {
  return (
    <AppEnvironmentContextProvider>
      <CurrentUserContextProvider>
        <Main />
      </CurrentUserContextProvider>
    </AppEnvironmentContextProvider>
  );
}

function Main() {
  const env = useAppEnvironmentContext()
  const {currentUser} = useCurrentUserContext()
  return (
    <>
      {env === null ? (
        <p>"No environment info available"</p>
      ) : (
        <div>
          <p>Environment: {env.environment}</p>
          <p>CSRF token: {env.csrfToken}</p>
        </div>
      )}
      <hr />

      {currentUser === null ? <LoginPanel /> : <MainUI />}
    </>
  );
}

function LoginPanel() {
  const { setCurrentUser } = useCurrentUserContext()
    return  <div>
        <button
          onClick={() =>
            setCurrentUser({ email: "nobody@nowhere.com", id: "123abc" })
          }
        >
          Fake login
        </button>
      </div>
}

function MainUI() {
  // current user can't be null or we wouldn't be here
  const { currentUser } = useCurrentUserContext() as User
  return <p>User logged in as: {currentUser.email} ({currentUser.id})</p>
}

export default App;
