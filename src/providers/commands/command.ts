export abstract class Command {
  abstract execute(): Promise<void>
}

export abstract class UndoableCommand extends Command {
  abstract undo(): Promise<void>
  abstract undoDescription(): string | null
}
