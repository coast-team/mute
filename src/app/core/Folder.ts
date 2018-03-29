import { File } from './File'

export class Folder extends File {

  public icon: string
  public isRemote: boolean

  static deserialize (id: string, serialized: any): Folder {
    const folder = new Folder()
    folder.icon = serialized.icon
    folder.isRemote = serialized.isRemote
    folder.deserialize(id, serialized)
    return folder
  }

  static create (title: string, icon: string, isRemote: boolean, parentFolderId?: string): Folder {
    const folder = new Folder()
    folder.created = new Date()
    folder.init(title, parentFolderId)
    folder.isRemote = isRemote
    folder.icon = icon
    return folder
  }

  constructor () {
    super()
  }

  get isDoc () { return false }

  get title () { return this._title }

  set title (newTitle: string) {
    this._title = newTitle || 'Untitled Folder'
  }

  serialize (): object {
    return Object.assign(super.serialize(), {
      type: 'folder',
      icon: this.icon,
      isRemote: this.isRemote
    })
  }
}
