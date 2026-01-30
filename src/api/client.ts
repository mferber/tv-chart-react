import { type User } from "../contexts/CurrentUserStatusContext"
import { getCSRFCookie } from "../utils/cookies"

const API_BASE = "/api"
const CSRF_TOKEN_HEADER_NAME = "X-CSRFToken"
const HTTP_STATUS_UNAUTHORIZED = 401

export class HttpUnauthorizedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "HttpUnauthorizedError"
  }
}

export class HttpError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "HttpError"
  }
}

export async function fetchCurrentUser(): Promise<User> {
  const fresult = await fetch(`${API_BASE}/auth/users/me`, {
    method: "GET",
  })
  if (fresult.ok) {
    return (await fresult.json()) as User
  }
  if (fresult.status === HTTP_STATUS_UNAUTHORIZED) {
    throw new HttpUnauthorizedError("User not authenticated")
  }
  throw new HttpError(
    `HTTP error attempting to fetch user: ${fresult.status} ${fresult.statusText} - ${await fresult.text()}`,
  )
}

export async function fetchLogin(
  email: string,
  password: string,
): Promise<User> {
  const fresult = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
    headers: { [CSRF_TOKEN_HEADER_NAME]: getCSRFCookie() }, // FIXME implement auto CSRF header for non-GET requests
  })
  if (fresult.ok) {
    return (await fresult.json()) as User
  }
  if (fresult.status === HTTP_STATUS_UNAUTHORIZED) {
    throw new HttpUnauthorizedError("Login failed")
  }
  throw new HttpError(
    `HTTP error attempting to log in user: ${fresult.status} ${fresult.statusText} - ${await fresult.text()}`,
  )
}

export async function fetchLogout(): Promise<string> {
  const fresult = await fetch(`${API_BASE}/auth/logout`, { method: "GET" })
  if (fresult.ok) {
    return await fresult.text()
  }
  if (fresult.status === HTTP_STATUS_UNAUTHORIZED) {
    throw new HttpUnauthorizedError("User not authenticated")
  }
  throw new HttpError(
    `HTTP error attempting to fetch user: ${fresult.status} ${fresult.statusText} - ${await fresult.text()}`,
  )
}
