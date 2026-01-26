import { useEffect, useState } from "react";

export interface AppEnvironmentType {
  environment: string | null
  csrfToken: string | null
}

// Hook: fetches app environment identifier, and with it, a CSRF token cookie.
// Returns both once request completes.
export function useFetchAppEnvironment(): AppEnvironmentType {
  const [appEnvironment, setAppEnvironment] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  const CSRF_TOKEN_COOKIE_NAME = "csrftoken"

  function getCookieValue(name: string): string {
    return (
      document.cookie.match("(^|;)\\s*" + name + "\\s*=\\s*([^;]+)")?.pop() ||
      ""
    );
  }

  useEffect(() => {
    const fetchEnv = async () => {
      const result = await fetch("/api/env");
      const csrfCookie = getCookieValue(CSRF_TOKEN_COOKIE_NAME)
      const environment = await result.text();

      setAppEnvironment(environment);
      setCsrfToken(csrfCookie);
    };
    fetchEnv();
  }, []);

  return {
    environment: appEnvironment,
    csrfToken: csrfToken,
  };
}
