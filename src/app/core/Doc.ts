import { AbstractStorageService } from './storage/AbstractStorageService'
import { LocalStorageService } from './storage/local-storage/local-storage.service'
import { Folder } from './Folder'
import { File } from './File'
import { BotStorageCotact } from './storage/bot-storage/BotStorageContact'

interface DocSerialize {
  id: string
  title: string
  parentId: string
  botIds: string[]
  icon: string
}

export class Doc extends File {

  private key: string
  private localStorage: LocalStorageService

  public botIds: string[]

  static deserialize (obj: DocSerialize, localStorage: LocalStorageService): Doc {
    const doc = new Doc(obj.id, obj.title, obj.parentId, localStorage, obj.icon)
    doc.botIds = obj.botIds || []
    return doc
  }

  constructor (
    key: string,
    title: string,
    parentId: string,
    localStorage?: LocalStorageService,
    icon = ''
  ) {
    super(title, parentId, icon)
    this.key = key
    this.botIds = []
    if (localStorage !== undefined) {
      this.localStorage = localStorage
    }
  }

  get id () {
    return this.key
  }

  addBotId (botId: string) {
    this.botIds.push(botId)
  }

  delete (): Promise<void> {
    return this.localStorage.delete(this)
  }

  getBody (): any {
    return this.localStorage.getBody(this)
  }

  save (body?: any) {
    return this.localStorage.save(this, body)
  }

  isSaved () {
    return this.localStorage.get(this.id)
      .then((doc) => doc !== undefined)
  }

  serialize (): DocSerialize {
    return {
      id: this.id,
      title: this.title,
      parentId: this.parentId,
      botIds: this.botIds,
      icon: this.icon
    }
  }

}
