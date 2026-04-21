import React, { use, useState } from "react"

import { infoToast } from "../../utils/toasts"
import { Command, UndoableCommand } from "./command"

/**
 * Hook for accessing a command executor from within a CommandExecutorProvider
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useCommandExecutor(): CommandExecutorContextType {
  const value = use(CommandExecutorContext)
  if (!value) {
    throw new Error(
      "useCommandExecutor must be used within CommandExecutorProvider",
    )
  }
  return value
}

/**
 * Provider component to provide downstream access to command executor object,
 * via useCommandExecutor()
 */
export function CommandExecutorProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [canUndo, setCanUndo] = useState(false)
  const [executor] = useState(
    () => new CommandExecutor((canUndo: boolean) => setCanUndo(canUndo)),
  )

  return (
    <CommandExecutorContext value={{ executor, canUndo: canUndo }}>
      {children}
    </CommandExecutorContext>
  )
}

/**
 * Implementation context
 */
type CommandExecutorContextType = {
  executor: CommandExecutor
  canUndo: boolean
}
const CommandExecutorContext =
  React.createContext<CommandExecutorContextType | null>(null)

/**
 * Command executor: executes Commands on request; maintains an undo stack and undoes
 * the most recent command on request
 */
// eslint-disable-next-line react-refresh/only-export-components
export class CommandExecutor {
  private readonly undoStack: UndoableCommand[] = []
  updateCanUndoState: (canUndo: boolean) => void

  constructor(updateCanUndoState: (canUndo: boolean) => void) {
    this.updateCanUndoState = updateCanUndoState
  }

  /**
   * @throws if any error occurs in the command
   */
  async execute(command: Command) {
    await command.execute()

    if (command instanceof UndoableCommand) {
      this.undoStack.push(command)
      this.updateCanUndoState(true)
    } else {
      // non-undoable command acts as a barrier
      this.undoStack.length = 0
      this.updateCanUndoState(false)
    }
  }

  async undo() {
    const command = this.undoStack.pop()
    if (!command) {
      // the UI should prevent this scenario
      return console.log("Undo requested: nothing to undo")
    }

    if (this.undoStack.length === 0) {
      this.updateCanUndoState(false)
    }
    await command.undo()

    const desc = command.undoDescription()
    if (desc) {
      infoToast(`Undone: ${desc}`)
    }
  }
}
