import { type ShowList } from "../../schemas/schemas"
import { ShowDisplay } from "./ShowDisplay"

export function ShowDisplayList({ shows }: { shows: ShowList }) {
  return (
    <div>
      {shows.map((show) => (
        <ShowDisplay show={show} key={show.id} />
      ))}
    </div>
  )
}
