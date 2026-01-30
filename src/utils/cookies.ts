export const CSRF_TOKEN_COOKIE_NAME = "csrftoken"

export function getCookieValue(cookieName: string): string | null {
  return (
    document.cookie
      .match("(^|;)\\s*" + cookieName + "\\s*=\\s*([^;]+)")
      ?.pop() || null
  )
}

export function getCSRFCookie() {
  return getCookieValue(CSRF_TOKEN_COOKIE_NAME) || ""
}
