import { LocalStorageService } from './storage/local-storage/local-storage.service'
import { Folder } from './Folder'
import { FolderBot } from './storage/bot-storage/FolderBot'
import { File } from './File'
import { BotInfo } from './storage/bot-storage/BotInfo'

export interface DocSerialize {
  id: string
  title: string
  bot: BotInfo
  localFolderId: string
}

export class Doc extends File {
  private key: string
  private sync: boolean
  private syncDate: Date
  private localStorage: LocalStorageService

  public bot: BotInfo
  public localFolder: Folder
  public botFolder: FolderBot

  static deserialize (obj: DocSerialize, localStorage: LocalStorageService, localFolder: Folder): Doc {
    const doc = new Doc(obj.id, obj.title, localStorage, localFolder)
    doc.bot = obj.bot
    return doc
  }

  constructor (
    key: string,
    title: string,
    localStorage: LocalStorageService,
    localFolder?: Folder
  ) {
    super(title)
    this.sync = false
    this.syncDate = new Date()
    this.key = key
    this.localFolder = localFolder
    this.localStorage = localStorage
  }

  get id () { return this.key }

  delete (): Promise<void> {
    if (this.localFolder) {
      return this.localStorage.delete(this)
    } else {
      return Promise.reject(new Error('The document is not in the local storage, thus cannot be deleted.'))
    }
  }

  getBody (): any {
    return this.localStorage.getBody(this)
  }

  save (body?: any) {
    return this.localStorage.save(this, body)
  }

  isSaved (): Promise<boolean> {
    return this.localStorage.get(this.id)
      .then(() => true)
      .catch((err) => false)
  }

  serialize (): DocSerialize {
    return {
      id: this.id,
      title: this.title,
      bot: this.bot,
      localFolderId: this.localFolder.id
    }
  }

  setSync (sync: boolean) {
    this.sync = sync
    if (sync) {
      this.syncDate = new Date()
    }
  }

  getStorageIcons () {
    const icons: string[] = []
    if (this.localFolder) {
      icons[0] = this.localFolder.icon
    }
    if (this.botFolder) {
      icons[icons.length] = this.botFolder.icon
    }
    return icons
  }

}
