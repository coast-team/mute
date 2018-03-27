import { File } from './File'

export class Folder extends File {

  public icon: string

  static deserialize (id: string, serialized: any): Folder {
    const folder = new Folder(serialized.title, serialized.icon, serialized.parentFolderId)
    File.deserialize(id, serialized, folder)
    return folder
  }

  constructor (title: string, icon: string, parentFolderId?: string) {
    super(title, parentFolderId)
    this.icon = icon
  }

  get isDoc () { return false }

  get title () { return this._title }

  set title (newTitle: string) {
    this._title = newTitle || 'Untitled Folder'
  }

  serialize (): object {
    return Object.assign(super.serialize(), {
      type: 'folder',
      icon: this.icon
    })
  }
}
