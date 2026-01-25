import { useState, useEffect, createContext, use } from 'react'
import { type ReactNode } from 'react'

const AppEnvironmentContext = createContext<string | null>(null)

// Provides the app environment context; also carries out initial request to server
// to find out the environment and get a CSRF protection cookie
function AppEnvironmentContextProvider({ children }: { children: ReactNode }) {
  const [env, setEnv] = useState<string | null>(null)

  useEffect(() => {
    setTimeout(async () => {
      const rsp = await fetch("/api/env");
      const result = await rsp.text();
      setEnv(result);
    }, 1500);
  }, []);

  return (
    <AppEnvironmentContext value={env}>
      {children}
    </AppEnvironmentContext>
  )
}

function App() {
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
