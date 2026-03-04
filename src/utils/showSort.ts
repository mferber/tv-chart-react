import { type Show } from "../types/schemas"

/**
 * Sorts a list of shows by title, applying standard title sorting rules
 * (ignores leading a/an/the)
 * @param showList list of shows
 * @returns sorted list
 */
export function titleSort(showList: Show[]): Show[] {
  const keyed_shows = showList.map((show) => ({
    show: show,
    key: titleSortKey(show),
  }))

  keyed_shows.sort((a, b) => a.key.localeCompare(b.key))
  return keyed_shows.map((ks) => ks.show)
}

// generates sortable version of show title
function titleSortKey(show: Show): string {
  return show.title.replace(/^(a|an|the) /i, "").toLowerCase()
}
