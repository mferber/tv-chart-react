import { type Show, type ShowList } from "../../schemas/schemas"
import { ShowDisplay } from "./ShowDisplay"

function titleSortKey(show: Show): string {
  return show.title.replace(/^(a|an|the) /i, "").toLowerCase()
}

function titleSort(shows: ShowList): ShowList {
  const keyed_shows = shows.map((show) => ({
    show: show,
    key: titleSortKey(show),
  }))

  keyed_shows.sort((a, b) => a.key.localeCompare(b.key))
  return keyed_shows.map((ks) => ks.show)
}

export function ShowDisplayList({ shows }: { shows: ShowList }) {
  return (
    <div>
      {titleSort(shows).map((show) => (
        <ShowDisplay show={show} key={show.id} />
      ))}
    </div>
  )
}
