import { Observable, Subject } from 'rxjs'
import { auditTime } from 'rxjs/operators'

import { Folder } from './Folder'
import { IStorage } from './storage/IStorage'

const METADATA_SAVE_INTERVAL = 1000

export abstract class File {
  public static PARENT_FOLDER_ID = 100
  public static PREVIOUS_PARENT_ID = 101
  public static DESCRIPTION = 102
  public static TITLE = 103
  public static TITLE_MODIFIED = 104
  public static OPENED = 105
  public static MODIFIED = 106
  public static MODIFIED_BY_OTHERS = 107
  public static CREATED = 108

  private _parentFolderId: string
  private _opened: Date

  protected _description: string
  protected storage: IStorage
  protected changes: Subject<{ isLocal: boolean; changedProperties: number[] }>
  protected _title: string

  public created: Date
  public titleModified: Date
  public id: string
  public previousParentFolderId: string
  public modified: Date
  public modifiedByOthers: Date

  constructor(storage: IStorage, title: string, parentFolderId: string) {
    this.storage = storage
    this.changes = new Subject()
    this._title = title
    this._parentFolderId = parentFolderId || ''
    this._description = ''
    this.titleModified = new Date(null)
    this.onMetadataChanges.pipe(auditTime(METADATA_SAVE_INTERVAL)).subscribe(() => this.saveMetadata())
  }

  protected deserialize(id: string, serialized: any) {
    this.id = id
    this.previousParentFolderId = serialized.previousParentFolderId
    this.created = serialized.created
    this._opened = serialized.opened
    this.modified = serialized.modified
    this.modifiedByOthers = serialized.modifiedByOthers
    this._description = serialized.description
    this._title = serialized.title
    this.titleModified = serialized.titleModified || new Date(null)
    this._parentFolderId = serialized.parentFolderId
  }

  abstract get isDoc(): boolean

  abstract get title()
  abstract set title(newTitle: string)

  abstract get description()
  abstract set description(newTitle: string)

  get onMetadataChanges(): Observable<{ isLocal: boolean; changedProperties: number[] }> {
    return this.changes.asObservable()
  }

  abstract saveMetadata()

  async move(folder: Folder) {
    await this.storage.move(this, folder)
  }

  async delete() {
    await this.storage.delete(this)
  }

  get opened() {
    return this._opened
  }

  set opened(value: Date) {
    if (this._opened !== value) {
      this._opened = value
      this.changes.next({ isLocal: true, changedProperties: [File.OPENED] })
    }
  }

  get parentFolderId() {
    return this._parentFolderId
  }

  set parentFolderId(id: string) {
    if (this._parentFolderId !== id) {
      this.previousParentFolderId = this._parentFolderId
      this._parentFolderId = id
      this.modified = new Date()
      this.changes.next({
        isLocal: true,
        changedProperties: [File.PARENT_FOLDER_ID, File.MODIFIED],
      })
    }
  }

  dispose() {
    this.changes.complete()
  }

  serialize(): object {
    return {
      title: this._title,
      titleModified: this.titleModified,
      parentFolderId: this.parentFolderId,
      previousParentFolderId: this.previousParentFolderId,
      created: this.created,
      opened: this._opened,
      modified: this.modified,
      modifiedByOthers: this.modifiedByOthers,
      description: this.description,
    }
  }
}
