import {
  AppEnvironmentContextProvider,
  useAppEnvironmentContext,
} from "./contexts/AppEnvironmentContext"

function App() {
  return (
    <AppEnvironmentContextProvider>
        <Main />
    </AppEnvironmentContextProvider>
}

function Main() {
  const env = useAppEnvironmentContext()
  return (
    <>
      <h1>Here we go</h1>
      <AppEnvironmentContextProvider>
        <Display />
      </AppEnvironmentContextProvider>
    </>
  )
}

function Display() {
  const env = use(AppEnvironmentContext)
  return <>
    <p>Hello: {env ?? "null"}</p>
  </>

}

export default App;
