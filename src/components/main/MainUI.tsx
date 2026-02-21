import { useQuery } from "@tanstack/react-query"

import { useCurrentUserStatusContext } from "../../contexts/CurrentUserStatusContext"
import { LogOutLink } from "../authentication/LogOutLink"
import { fetchShows } from "../../api/client"
import { showListSchema, type Show } from "../../schemas/schemas"
import { useQueryErrorToast } from "../../hooks"

export function MainUI() {
  // User can't be null or we wouldn't be here
  const currentUser = useCurrentUserStatusContext().user!

  const showsQuery = useQuery({ queryKey: ["shows"], queryFn: fetchShows })
  useQueryErrorToast(
    showsQuery,
    "Shows could not be loaded due to a network problem",
  )

  return (
    <>
      <div>
        <span className="font-bold">{currentUser.email}</span> (
        <LogOutLink>Log out</LogOutLink>)
      </div>
      <hr />

      <h1>Shows:</h1>
      {showsQuery.error && <div>Couldn't load shows — try reloading</div>}
      {showsQuery.data && (
        <div>
          {showListSchema.parse(showsQuery.data).map((show) => (
            <Show show={show} key={show.id} />
          ))}
        </div>
      )}
    </>
  )
}

function Show({ show }: { show: Show }) {
  return (
    <>
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
    </>
  )
}
