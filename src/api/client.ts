import { type UpdateUserFieldsValues } from "../providers/commands/UpdateUserFieldsCommand"
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
  type UserPrefs,
  userPrefsSchema,
} from "../types/schemas"
import { type PartialEpisodeSpecifier } from "../types/types"
import { getCSRFCookie } from "../utils/cookies"

const API_BASE = import.meta.env.VITE_API_BASE_URL
const CSRF_TOKEN_HEADER_NAME = "X-CSRFToken"
const HTTP_BAD_REQUEST = 400
const HTTP_STATUS_UNAUTHORIZED = 401
const HTTP_CONFLICT = 409

export class UndefinedApiBaseUrlError extends Error {
  constructor() {
    super()
    this.name = "UndefinedApiBaseUrlError"
  }
}

export class HttpBadRequestError extends Error {
  constructor() {
    super()
    this.name = "HttpBadRequestError"
  }
}

export class HttpUnauthorizedError extends Error {
  constructor() {
    super()
    this.name = "HttpUnauthorizedError"
  }
}

export class HttpConflictError extends Error {
  constructor() {
    super()
    this.name = "HttpConflictError"
  }
}

export class HttpError extends Error {
  constructor() {
    super()
    this.name = "HttpError"
  }
}

// Fetch wrapper that (a) prepends the API base URL, and (b) permit credentials
// (including CSRF cookie) on cross-origin requests
export function apiFetch(
  relativeUrl: string,
  options: RequestInit = {},
): Promise<Response> {
  if (API_BASE === undefined) {
    console.error(
      "Environment var VITE_API_BASE_URL is unset: it must contain the API base URL",
    )
    throw new UndefinedApiBaseUrlError()
  }

  // FIXME: always add content type header, even when CSRF header is already present
  if (!options.headers) {
    options.headers = {}
    options.headers["Content-Type"] = "application/json"
  }
  return fetch(`${API_BASE}${relativeUrl}`, {
    ...options,
    credentials: "include",
  })
}

export async function fetchCurrentUser(): Promise<User> {
  const fetchResponse = await apiFetch("/auth/users/me", {
    method: "GET",
  })
  await handleError(fetchResponse, "HTTP error attempting to fetch user")
  return (await fetchResponse.json()) as User
}

export async function fetchLogin(
  email: string,
  password: string,
): Promise<User> {
  const fetchResponse = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    headers: { [CSRF_TOKEN_HEADER_NAME]: getCSRFCookie() }, // FIXME implement auto CSRF header for non-GET requests
  })
  await handleError(fetchResponse, "HTTP error attempting to log in user")
  return (await fetchResponse.json()) as User
}

export async function fetchRegisterUser(
  email: string,
  password: string,
): Promise<User> {
  const fetchResponse = await apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    headers: { [CSRF_TOKEN_HEADER_NAME]: getCSRFCookie() }, // FIXME implement auto CSRF header for non-GET requests
  })
  await handleError(fetchResponse, "HTTP error attempting to register user")
  return (await fetchResponse.json()) as { id: string; email: string }
}

export async function fetchLogout(): Promise<string> {
  const fetchResponse = await apiFetch("/auth/logout", {
    method: "GET",
  })
  await handleError(fetchResponse, "HTTP error attempting to fetch user")
  return await fetchResponse.text()
}

export async function fetchShows(): Promise<ShowRecord> {
  const fetchResponse = await apiFetch("/shows", { method: "GET" })
  await handleError(
    fetchResponse,
    "HTTP error attempting to fetch show listings",
  )
  return showMapSchema.parse(await fetchResponse.json())
}

export async function fetchEpisodes(
  showId: string,
): Promise<EpisodeDetails[][]> {
  const fetchResponse = await apiFetch(`/episodes/${showId}`)
  await handleError(
    fetchResponse,
    "HTTP error attempting to fetch show listings",
  )
  return episodeDetailsTableSchema.parse(await fetchResponse.json())
}

export async function fetchShowSearchResults(
  searchTerm: string,
): Promise<ShowSearchResults> {
  const fetchResponse = await apiFetch(
    `/search?q=${encodeURIComponent(searchTerm)}`,
  )
  await handleError(
    fetchResponse,
    "HTTP error attempting to fetch show search results",
  )
  return showSearchResultsSchema.parse(await fetchResponse.json())
}

export async function addShowFromTVmazeId(tvmaze_id: number): Promise<Show> {
  const fetchResponse = await apiFetch(`/add-show?tvmaze_id=${tvmaze_id}`)
  await handleError(fetchResponse, "HTTP error attempting to add new show")
  return showSchema.parse(await fetchResponse.json())
}

export async function toggleEpisodes(
  showId: string,
  episodes: PartialEpisodeSpecifier[],
): Promise<void> {
  const episodeList = episodes.map((specifier) => [
    specifier.seasonNum - 1,
    specifier.episodeIdx,
  ])
  const body = { show_id: showId, episodes: episodeList }
  const fetchResponse = await apiFetch("/toggle-watched-status", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { [CSRF_TOKEN_HEADER_NAME]: getCSRFCookie() }, // FIXME implement auto CSRF header for non-GET requests
  })
  await handleError(
    fetchResponse,
    "HTTP error attempting to toggle watched status",
  )
}

export async function deleteShow(showId: string): Promise<void> {
  const fetchResponse = await apiFetch(`/shows/${showId}`, {
    method: "DELETE",
    headers: { [CSRF_TOKEN_HEADER_NAME]: getCSRFCookie() }, // FIXME implement auto CSRF header for non-GET requests
  })
  await handleError(fetchResponse, "HTTP error attempting to delete show")
}

export async function toggleFavorite(showId: string): Promise<void> {
  const body = { show_id: showId }
  const fetchResponse = await apiFetch(`/toggle-favorite`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { [CSRF_TOKEN_HEADER_NAME]: getCSRFCookie() },
  })
  await handleError(
    fetchResponse,
    "HTTP error attempting to toggle favorite status",
  )
}

export async function updateUserFields(
  showId: string,
  values: UpdateUserFieldsValues,
): Promise<void> {
  const body = {
    show_id: showId,
    user_channel: values.channel,
    user_notes: values.notes,
  }
  const fetchResponse = await apiFetch("/update-user-fields", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { [CSRF_TOKEN_HEADER_NAME]: getCSRFCookie() },
  })
  await handleError(
    fetchResponse,
    "HTTP error attempting to update user fields",
  )
}

export async function fetchUserPrefs(): Promise<UserPrefs> {
  const fetchResponse = await apiFetch("/user-prefs")
  await handleError(
    fetchResponse,
    "HTTP error attempting to get user preferences",
  )
  return userPrefsSchema.parse(await fetchResponse.json())
}

export async function updateUserPrefs(newPrefs: UserPrefs): Promise<void> {
  const fetchResponse = await apiFetch("/user-prefs", {
    method: "PUT",
    body: JSON.stringify(newPrefs),
    headers: { [CSRF_TOKEN_HEADER_NAME]: getCSRFCookie() },
  })
  await handleError(
    fetchResponse,
    "HTTP error attempting to update user preferences",
  )
}

// Clicking on a native download link is far simpler than using fetch
export function getExportUrl() {
  return `${API_BASE}/data/export`
}

export async function uploadImportFile(file: File): Promise<void> {
  const formData = new FormData()
  formData.append("file", file)

  const fetchResponse = await apiFetch("/data/import", {
    method: "POST",
    body: formData,
    headers: { [CSRF_TOKEN_HEADER_NAME]: getCSRFCookie() },
  })
  if (fetchResponse.status === HTTP_BAD_REQUEST) {
    // log the error details to help with troubleshooting
    console.error(await fetchResponse.json())
    throw new HttpBadRequestError()
  }
  await handleError(
    fetchResponse,
    "HTTP error attempting to restore from backup",
  )
}

async function handleError(fetchResponse: Response, errorMsg: string) {
  if (fetchResponse.ok) {
    return
  }
  if (fetchResponse.status === HTTP_STATUS_UNAUTHORIZED) {
    throw new HttpUnauthorizedError()
  }
  if (fetchResponse.status === HTTP_CONFLICT) {
    throw new HttpConflictError()
  }
  console.error(
    `${errorMsg}: ${fetchResponse.status} ${fetchResponse.statusText}`,
  )
  console.error("Throwing HTTPError")
  throw new HttpError()
}
