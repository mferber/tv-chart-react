import { type Dispatch, type SetStateAction, useState } from "react"
import { ThreeDots } from "react-loader-spinner"

import {
  CommandExecutorProvider,
  useCommandExecutor,
} from "../../providers/commands/CommandExecutorProvider"
import { useCurrentUserStatus } from "../../providers/CurrentUserStatusProvider"
import {
  ShowsQueryProvider,
  useShowsQuery,
} from "../../providers/ShowsQueryProvider"
import { LogOutLink } from "../authentication/LogOutLink"
import { SearchModal } from "./search/SearchModal"
import { ShowList } from "./showList/ShowList"

export function MainUI() {
  return (
    <ShowsQueryProvider>
      <CommandExecutorProvider>
        <MainUIBody />
      </CommandExecutorProvider>
    </ShowsQueryProvider>
  )
}

function MainUIBody() {
  const [searchUIOpen, setSearchUIOpen] = useState(false)
  const showsQuery = useShowsQuery()

  return (
    <main className="m-4">
      <AppHeader
        setSearchUIOpen={setSearchUIOpen}
        refetch={showsQuery.refetch}
        isRefetching={showsQuery.isRefetching}
      />
      {showsQuery.error && (
        <div className="flex h-20 justify-center items-center text-xl">
          Couldn't load shows — try reloading
        </div>
      )}
      {showsQuery.isPending && (
        <div className="flex h-40 justify-center items-center">
          <ThreeDots width="50" height="15" color="black" />
        </div>
      )}

      {showsQuery.data && !showsQuery.error && (
        <ShowList shows={showsQuery.data} />
      )}

      <SearchModal
        isOpen={searchUIOpen}
        close={() => setSearchUIOpen(false)}
        shows={showsQuery.data}
      />
    </main>
  )
}

function AppHeader({
  setSearchUIOpen,
  refetch,
  isRefetching,
}: {
  setSearchUIOpen: Dispatch<SetStateAction<boolean>>
  refetch: () => void
  isRefetching: boolean
}) {
  // User can't be null or we wouldn't be here
  const currentUser = useCurrentUserStatus().user!

  const { executor, canUndo } = useCommandExecutor()

  return (
    <div className="flex justify-between border-b mb-4 align-middle">
      <span className="flex gap-4 items-baseline">
        <a
          href="#"
          className="hover:text-red-800"
          onClick={() => setSearchUIOpen(true)}
        >
          Add new show
        </a>
        <span className="flex items-center gap-2">
          <a href="#" className="hover:text-red-800" onClick={() => refetch()}>
            Refresh
          </a>
          {isRefetching && (
            <ThreeDots height="10" wrapperClass="w-4 h-3" color="black" />
          )}
        </span>

        <a
          href="#"
          className={`${canUndo ? "text-black" : "text-gray-300"}`}
          onClick={() => executor.undo()}
        >
          Undo
        </a>
      </span>
      <span>
        <span className="font-bold">{currentUser.email}</span> (
        <LogOutLink>Log out</LogOutLink>)
      </span>
    </div>
  )
}
