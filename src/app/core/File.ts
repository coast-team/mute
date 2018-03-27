import { Folder } from './Folder'

export abstract class File {
  private _parentFolderId: string
  protected _title: string

  public id: string
  public previousParentFolderId: string
  public created: Date
  public opened: Date
  public modified: Date
  public description: string

  static deserialize (id: string, serialized: any, file: File) {
    // title and _parentFolderId have been already deserialized in the file constructor
    file.id = id
    file.previousParentFolderId = serialized.previousParentFolderId
    file.created = serialized.created
    file.opened = serialized.opened
    file.modified = serialized.modified
    file.description = serialized.description
  }

  constructor (title: string, parentFolderId?: string) {
    this.title = title
    this.parentFolderId = parentFolderId || ''
    this.description = ''
  }

  abstract get isDoc (): boolean

  abstract get title ()

  abstract set title (newTitle: string)

  get parentFolderId () { return this._parentFolderId }

  set parentFolderId (id: string) {
    this.previousParentFolderId = this._parentFolderId
    this._parentFolderId = id
  }

  serialize (): object {
    return {
      title: this._title,
      parentFolderId: this.parentFolderId,
      previousParentFolderId: this.previousParentFolderId,
      created: this.created,
      opened: this.opened,
      modified: this.modified,
      description: this.description,
    }
  }
}
