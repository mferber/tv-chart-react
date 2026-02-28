import { type Show, type ShowRecord } from "../../schemas/schemas"
import { ShowDisplay } from "./ShowDisplay"

function titleSortKey(show: Show): string {
  return show.title.replace(/^(a|an|the) /i, "").toLowerCase()
}

function titleSort(showList: Show[]): Show[] {
  const keyed_shows = showList.map((show) => ({
    show: show,
    key: titleSortKey(show),
  }))

  keyed_shows.sort((a, b) => a.key.localeCompare(b.key))
  return keyed_shows.map((ks) => ks.show)
}

export function ShowDisplayList({ shows }: { shows: ShowRecord }) {
  const showList = Object.values(shows)
  return (
    <div>
      {titleSort(showList).map((show) => (
        <ShowDisplay show={show} key={show.id} />
      ))}
    </div>
  )
}
