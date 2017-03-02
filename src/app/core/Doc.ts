import { AbstractStorageService } from './storage/AbstractStorageService'
import { LocalStorageService } from './storage/local-storage/local-storage.service'
import { Folder } from './Folder'
import { File } from './File'
import { BotStorageCotact } from './storage/bot-storage/BotStorageContact'

export class Doc extends File {
  private key: string
  public botContacts: Set<BotStorageCotact>
  public storages: AbstractStorageService[]

  constructor (
    key: string,
    title: string,
    parent: Folder,
    storage?: AbstractStorageService,
    icon = ''
  ) {
    super(title, parent, icon)
    this.key = key
    this.botContacts = new Set()
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

  addBotContact (bot: BotStorageCotact) {
    this.botContacts.add(bot)
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
