import { ShowDisplay } from "./ShowDisplay"
import { type ShowList } from "../../schemas/schemas"

export function ShowDisplayList({ shows }: { shows: ShowList }) {
  return (
    <div>
      {shows.map((show) => (
        <ShowDisplay show={show} key={show.id} />
      ))}
    </div>
  )
}
