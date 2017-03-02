import { AbstractStorageService } from './storage/AbstractStorageService'
import { Folder } from './Folder'

export abstract class File {
  public storages: AbstractStorageService[]

  readonly title: string
  readonly parent: Folder|null
  readonly icon: string

  constructor (title: string, parent, icon = '') {
    this.title = title
    this.parent = parent
    this.icon = icon
  }

  abstract get id ()
  abstract delete (): Promise<void>

  isDoc (): boolean {
    return !(this instanceof Folder)
  }

}
