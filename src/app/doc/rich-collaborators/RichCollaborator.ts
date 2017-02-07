import { Collaborator } from 'mute-core'

export class RichCollaborator extends Collaborator {

  constructor (
    id: number,
    pseudo: string,
    readonly color: string,
  ) {
    super(id, pseudo)
  }
}
