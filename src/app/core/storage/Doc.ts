import { AbstractStorageService } from './AbstractStorageService'
import { LocalStorageService } from './local-storage/local-storage.service'
import { Folder } from './Folder'
import { File } from './File'

export class Doc extends File {
  private key: string
  public storages: AbstractStorageService[]

  constructor (key: string, title: string, parent: Folder, storage?: AbstractStorageService, icon = '') {
    super(title, parent, icon)
    this.storages = new Array<AbstractStorageService>()
    if (storage !== undefined) {
      this.addStorage(storage)
    }
  }

  get id () {
    return this.key
  }

  addStorage (storage: AbstractStorageService) {
    this.storages[this.storages.length] = storage
  }

  delete (): Promise<void> {
    for (let s of this.storages) {
      if (s instanceof LocalStorageService) {
        return s.delete(this)
      }
    }
    return Promise.resolve()
  }

  getFiles () {
    return []
  }
}
