import {
  faArrowsRotate,
  faClockRotateLeft,
  faPlus,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { type Dispatch, type SetStateAction, useState } from "react"
import { ThreeDots } from "react-loader-spinner"

import Couch from "../../assets/couch.svg?react"
import {
  CommandExecutorProvider,
  useCommandExecutor,
} from "../../providers/commands/CommandExecutorProvider"
import { useCurrentUserStatus } from "../../providers/CurrentUserStatusProvider"
import {
  ShowsQueryProvider,
  useShowsQuery,
} from "../../providers/ShowsQueryProvider"
import { infoToast } from "../../utils/toasts"
import { LogOutLink } from "../authentication/LogOutLink"
import {
  CustomDropdownMenuContent,
  CustomDropdownMenuItem,
  CustomDropdownMenuSeparator,
} from "../misc/CustomDropdownMenu"
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
    // leave room at top for fixed toolbar (see AppHeader)
    <main className="mx-4 mb-4 mt-14">
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
        <>
          {Object.keys(showsQuery.data).length === 0 && (
            <div className="text-lg">
              <span className="font-bold">Your show list is empty! </span>
              Use the <FontAwesomeIcon icon={faPlus} /> to add your first show.
            </div>
          )}
          <ShowList shows={showsQuery.data} />
        </>
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
}: {
  setSearchUIOpen: Dispatch<SetStateAction<boolean>> // FIXME
  refetch: () => void
  isRefetching: boolean
}) {
  // User can't be null or we wouldn't be here
  const currentUser = useCurrentUserStatus().user!

  const { executor, canUndo } = useCommandExecutor()

  return (
    <div className="fixed top-0 left-0 right-0 pt-2 px-4 bg-white z-1 flex justify-between border-b pb-2 mb-4 align-middle items-baseline">
      <span className="flex gap-4 items-baseline" title="Main menu">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger className="cursor-pointer focus:outline-none">
            <div className="group">
              <Couch className="inline h-6 relative -top-1 mr-2 group-hover:**:stroke-red-800!" />
              <span className="text-xl font-black group-hover:text-red-800">
                Couch Potato
              </span>
            </div>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <CustomDropdownMenuContent>
              <CustomDropdownMenuItem className="font-bold" nonselectable>
                {currentUser.email}
              </CustomDropdownMenuItem>
              <CustomDropdownMenuItem>
                <LogOutLink>Log out</LogOutLink>
              </CustomDropdownMenuItem>
              <CustomDropdownMenuSeparator />
              <CustomDropdownMenuItem>
                <a href={`${import.meta.env.VITE_API_BASE_URL}/data/export`}>
                  Download my data
                </a>
              </CustomDropdownMenuItem>
              <CustomDropdownMenuItem disabled>
                Upload replacement data
              </CustomDropdownMenuItem>
            </CustomDropdownMenuContent>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        <a
          href="#"
          className="hover:text-red-800"
          onClick={(e) => {
            e.preventDefault()
            setSearchUIOpen(true)
          }}
          title="Add new show"
        >
          <FontAwesomeIcon icon={faPlus} size="lg" />
        </a>
        <span className="flex items-center gap-2">
          <a
            href="#"
            className="hover:text-red-800"
            onClick={(e) => {
              e.preventDefault()
              infoToast("Refreshed show data")
              refetch()
            }}
            title="Refresh display"
          >
            <FontAwesomeIcon icon={faArrowsRotate} size="lg" />
          </a>
        </span>
      </span>
      <span className="flex gap-2 items-baseline">
        <a
          href="#"
          className={`${canUndo ? "text-black hover:text-red-800" : "text-gray-300 cursor-not-allowed"}`}
          onClick={(e) => {
            e.preventDefault()
            executor.undo()
          }}
          title="Undo last action"
        >
          <FontAwesomeIcon icon={faClockRotateLeft} size="lg" />
        </a>
      </span>
    </div>
  )
}
