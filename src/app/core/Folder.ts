import { Doc } from './Doc'
import { File } from './File'
import { IStorage } from './storage/IStorage'

const DEFAULT_TITLE = 'Untitled Folder'

export class Folder extends File {
  public icon: string
  public isRemote: boolean

  static deserialize(storage: IStorage, id: string, serialized: any): Folder {
    const folder = new Folder(storage, serialized.title, serialized.parentFolderId)
    folder.icon = serialized.icon
    folder.isRemote = serialized.isRemote
    folder.deserialize(id, serialized)
    return folder
  }

  static create(storage: IStorage, title: string, icon: string, isRemote: boolean, parentFolderId?: string): Folder {
    const folder = new Folder(storage, title, parentFolderId)
    folder._title = title
    folder.created = new Date()
    folder.isRemote = isRemote
    folder.icon = icon
    return folder
  }

  constructor(storage: IStorage, title: string, parentFolderId: string) {
    super(storage, title, parentFolderId)
  }

  get isDoc() {
    return false
  }

  get title() {
    return this._title
  }

  set title(newTitle: string) {
    this._title = newTitle || DEFAULT_TITLE
  }

  set description(newDescription: string) {
    this._description = newDescription
  }

  get description() {
    return this._description
  }

  async saveMetadata() {
    await this.storage.save(this)
  }

  async fetchDocs(): Promise<Doc[]> {
    return this.storage.fetchDocs(this)
  }

  serialize(): object {
    return Object.assign(super.serialize(), {
      type: 'folder',
      icon: this.icon,
      isRemote: this.isRemote,
    })
  }
}
