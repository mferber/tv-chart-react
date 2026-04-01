import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { Plus, RefreshCcw, Undo2 } from "lucide-react"
import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useState,
} from "react"
import { ThreeDots } from "react-loader-spinner"

import { getExportUrl } from "../../api/client"
import Couch from "../../assets/couch.svg?react"
import {
  CommandExecutorProvider,
  useCommandExecutor,
} from "../../providers/commands/CommandExecutorProvider"
import {
  useCurrentUserStatus,
  type User,
} from "../../providers/CurrentUserStatusProvider"
import {
  ShowsQueryProvider,
  useShowsQuery,
} from "../../providers/ShowsQueryProvider"
import { infoToast } from "../../utils/toasts"
import { LogOutLink } from "../authentication/LogOutLink"
import {
  ThemedDropdownMenuContent,
  ThemedDropdownMenuItem,
  ThemedDropdownMenuSeparator,
} from "../misc/ThemedDropdownMenu"
import { RestoreBackupManager } from "./restoreBackup/RestoreBackupManager"
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
              Use the <Plus className="inline" /> to add your first show.
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
    <div className="fixed top-0 left-0 right-0 pt-2 px-4 bg-white z-1 flex justify-between border-b pb-2 mb-4 align-middle items-center">
      <span className="flex gap-4 items-center" title="Main menu">
        <CouchMenu
          currentUser={currentUser}
          trigger={
            <div className="group">
              <Couch className="inline h-6 relative -top-1 mr-2 group-hover:**:stroke-red-800!" />
              <span className="text-xl font-black group-hover:text-red-800">
                Couch Potato
              </span>
            </div>
          }
        />
        <a
          href="#"
          className="hover:text-red-800"
          onClick={(e) => {
            e.preventDefault()
            setSearchUIOpen(true)
          }}
          title="Add new show"
        >
          <Plus />
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
            <RefreshCcw />
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
          <Undo2 />
        </a>
      </span>
    </div>
  )
}

function CouchMenu({
  currentUser,
  trigger,
}: {
  currentUser: User
  trigger: ReactNode
}) {
  const [restoreBackupManagerIsOpen, setRestoreBackupManagerIsOpen] =
    useState(false)

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger className="cursor-pointer focus:outline-none">
          {trigger}
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <ThemedDropdownMenuContent>
            <ThemedDropdownMenuItem className="font-bold" nonselectable>
              {currentUser.email}
            </ThemedDropdownMenuItem>
            <ThemedDropdownMenuItem>
              <LogOutLink>Log out</LogOutLink>
            </ThemedDropdownMenuItem>
            <ThemedDropdownMenuSeparator />
            <ThemedDropdownMenuItem>
              <a href={getExportUrl()}>Download backup data</a>
            </ThemedDropdownMenuItem>
            <ThemedDropdownMenuItem
              onSelect={() => setRestoreBackupManagerIsOpen(true)}
            >
              Restore data from backup
            </ThemedDropdownMenuItem>
          </ThemedDropdownMenuContent>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <RestoreBackupManager
        open={restoreBackupManagerIsOpen}
        setOpen={setRestoreBackupManagerIsOpen}
        key={restoreBackupManagerIsOpen ? "open" : "close"} // force state to reset on reopen
      />
    </>
  )
}
