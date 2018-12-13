import { ICollaborator } from '@coast-team/mute-core'

export class RichCollaborator {
  public id: number
  public login: string
  public displayName: string
  public email: string
  public avatar: string
  public color: string
  public deviceID: string

  constructor(collab: ICollaborator, color: string) {
    this.id = collab.id
    this.update(collab)
    this.color = color
  }

  update(collab: ICollaborator) {
    this.displayName = collab.displayName || this.displayName || ''
    this.deviceID = collab.deviceID || this.deviceID || ''
    this.login = collab.login || this.login || ''
    this.email = collab.email || this.email || ''
    this.avatar = collab.avatar || this.avatar || ''
  }
}
