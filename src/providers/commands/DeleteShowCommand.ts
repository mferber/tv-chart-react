import { deleteShow } from "../../api/client"
import { Command } from "./command"

export class DeleteShowCommand extends Command {
  showId: string

  constructor(showId: string) {
    super()
    this.showId = showId
  }

  async execute(): Promise<void> {
    await deleteShow(this.showId)
  }
}
