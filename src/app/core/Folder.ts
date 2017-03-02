import { AbstractStorageService } from './storage/AbstractStorageService'
import { File } from './File'

export class Folder extends File {
  private linkName
  public storage: AbstractStorageService

  constructor (
    linkName: string,
    title: string,
    parent: Folder|null,
    storage: AbstractStorageService,
    icon = ''
  ) {
    super(title, parent, icon)
    this.linkName = linkName
    this.storage = storage
  }

  get id () {
    return this.getId()
  }

  delete (): Promise<void> {
    return this.storage.delete(this)
  }

  deleteAll (): Promise<void> {
    return this.storage.deleteAll(this)
  }

  addFile (file: File): Promise<void> {
    return this.storage.addFile(this, file)
  }

  getFiles (): Promise<File[]> {
    return this.storage.getFiles(this)
  }

  private getId () {
    if (this.parent === null) {
      return this.linkName
    } else {
      return `${this.parent.id}/${this.linkName}`
    }
  }
}
