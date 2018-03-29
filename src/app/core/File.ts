import { Folder } from './Folder'

export abstract class File {
  private _parentFolderId: string
  private _description: string
  protected _title: string

  public id: string
  public previousParentFolderId: string
  public created: Date
  public opened: Date
  public modified: Date

  constructor() {}

  protected deserialize(id: string, serialized: any) {
    this.id = id
    this.previousParentFolderId = serialized.previousParentFolderId
    this.created = serialized.created
    this.opened = serialized.opened
    this.modified = serialized.modified
    this._description = serialized.description
    this._title = serialized.title
    this._parentFolderId = serialized.parentFolderId
  }

  protected init(title: string, parentFolderId?: string) {
    this.title = title
    this._parentFolderId = parentFolderId || ''
    this._description = ''
  }

  abstract get isDoc(): boolean

  abstract get title()
  abstract set title(newTitle: string)

  get parentFolderId() {
    return this._parentFolderId
  }
  set parentFolderId(id: string) {
    this.previousParentFolderId = this._parentFolderId
    this._parentFolderId = id
    this.modified = new Date()
  }

  get description() {
    return this._description
  }
  set description(description: string) {
    this._description = description
    this.modified = new Date()
  }

  serialize(): object {
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
