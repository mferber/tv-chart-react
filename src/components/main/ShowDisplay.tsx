import { type Show } from "../../schemas/schemas"

export function ShowDisplay({ show }: { show: Show }) {
  return (
    <section>
      <div className="flex gap-2">
        <img src={show.image_sm_url} className="w-16" />
        <div className="flex flex-col">
          <header className="text-xl font-black">{show.title}</header>
          <span>
            {show.source}, {show.duration} min.
          </span>
        </div>
      </div>
      {show.seasons.map((season, idx) => (
        // eslint-disable-next-line react-x/no-array-index-key
        <div key={idx}>
          Season {idx + 1}:{" "}
          {season.map((ep, idx) => {
            const classNames = []
            if (ep.type === "special") {
              classNames.push("underline")
            }
            if (ep.watched) {
              classNames.push("font-bold")
            }

            return (
              <span key={idx} className={classNames.join(" ")}>
                {idx + 1}{" "}
              </span>
            )
          })}
        </div>
      ))}
      <br />
    </section>
  )
}
