import { LocalStorageService } from './storage/local-storage/local-storage.service'
import { Folder } from './Folder'

export abstract class File {

  public title: string
  public parentId: string
  public icon: string

  constructor (title: string, parentId: string, icon = '') {
    this.title = title
    this.parentId = parentId
    this.icon = icon
  }

  abstract get id ()

  isDoc (): boolean {
    return !(this instanceof Folder)
  }

}
