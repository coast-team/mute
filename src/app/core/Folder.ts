import { AbstractStorageService } from './storage/AbstractStorageService'
import { LocalStorageService } from './storage/local-storage/local-storage.service'
import { File } from './File'

export class Folder extends File {

  private linkName: string

  public storage: AbstractStorageService

  constructor (
    linkName: string,
    title: string,
    parentId: string,
    storage: AbstractStorageService,
    icon = ''
  ) {
    super(title, parentId, icon)
    this.linkName = linkName
    this.storage = storage
  }

  get id (): string {
    return this.linkName
  }

  delete (): Promise<void> {
    return this.storage.deleteAll(this)
  }

  getFiles (): Promise<File[]> {
    return this.storage.getFiles(this)
  }
}
