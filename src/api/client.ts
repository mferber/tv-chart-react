import { type User } from "../providers/CurrentUserStatusProvider"
import {
  type EpisodeDetails,
  episodeDetailsTableSchema,
  type Show,
  showMapSchema,
  type ShowRecord,
  showSchema,
  type ShowSearchResults,
  showSearchResultsSchema,
} from "../types/schemas"
import { getCSRFCookie } from "../utils/cookies"

const API_BASE = "/api"
const CSRF_TOKEN_HEADER_NAME = "X-CSRFToken"
const HTTP_STATUS_UNAUTHORIZED = 401

export class HttpUnauthorizedError extends Error {
  constructor() {
    super()
    this.name = "HttpUnauthorizedError"
  }
}

export class HttpError extends Error {
  constructor() {
    super()
    this.name = "HttpError"
  }
}

export async function fetchCurrentUser(): Promise<User> {
  const fetchResponse = await fetch(`${API_BASE}/auth/users/me`, {
    method: "GET",
  })
  await handleError(fetchResponse, "HTTP error attempting to fetch user")
  return (await fetchResponse.json()) as User
}

export async function fetchLogin(
  email: string,
  password: string,
): Promise<User> {
  const fetchResponse = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
    headers: { [CSRF_TOKEN_HEADER_NAME]: getCSRFCookie() }, // FIXME implement auto CSRF header for non-GET requests
  })
  await handleError(fetchResponse, "HTTP error attempting to log in user")
  return (await fetchResponse.json()) as User
}

export async function fetchLogout(): Promise<string> {
  const fetchResponse = await fetch(`${API_BASE}/auth/logout`, {
    method: "GET",
  })
  await handleError(fetchResponse, "HTTP error attempting to fetch user")
  return await fetchResponse.text()
}

export async function fetchShows(): Promise<ShowRecord> {
  const fetchResponse = await fetch(`${API_BASE}/shows`, { method: "GET" })
  await handleError(
    fetchResponse,
    "HTTP error attempting to fetch show listings",
  )
  return showMapSchema.parse(await fetchResponse.json())
}

export async function fetchEpisodes(
  showId: string,
): Promise<EpisodeDetails[][]> {
  const fetchResponse = await fetch(`${API_BASE}/episodes/${showId}`)
  await handleError(
    fetchResponse,
    "HTTP error attempting to fetch show listings",
  )
  return episodeDetailsTableSchema.parse(await fetchResponse.json())
}

export async function fetchShowSearchResults(
  searchTerm: string,
): Promise<ShowSearchResults> {
  const fetchResponse = await fetch(
    `${API_BASE}/search?q=${encodeURIComponent(searchTerm)}`,
  )
  await handleError(
    fetchResponse,
    "HTTP error attempting to fetch show search results",
  )
  return showSearchResultsSchema.parse(await fetchResponse.json())
}

export async function addShowFromTVmazeId(tvmaze_id: number): Promise<Show> {
  const fetchResponse = await fetch(
    `${API_BASE}/add-show?tvmaze_id=${tvmaze_id}`,
  )
  await handleError(fetchResponse, "HTTP error attempting to add new show")
  return showSchema.parse(await fetchResponse.json())
}

async function handleError(fetchResponse: Response, errorMsg: string) {
  if (fetchResponse.ok) {
    return
  }
  if (fetchResponse.status === HTTP_STATUS_UNAUTHORIZED) {
    throw new HttpUnauthorizedError()
  }
  console.error(
    `${errorMsg}: ${fetchResponse.status} ${fetchResponse.statusText}`,
  )
  throw new HttpError()
}
