import React, { use, useState } from "react"

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
class CommandExecutor {
  private undoStack: Command[] = []
  updateCanUndoState: (canUndo: boolean) => void

  constructor(updateCanUndoState: (canUndo: boolean) => void) {
    this.updateCanUndoState = updateCanUndoState
  }

  async execute(command: Command) {
    try {
      await command.execute()
      this.undoStack.push(command)
      this.updateCanUndoState(true)
    } catch (err) {
      console.error(err)
      throw err
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
  }
}

abstract class Command {
  abstract execute(): Promise<void>
  abstract undo(): Promise<void>
}
