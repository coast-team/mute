import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Observable } from 'rxjs/Observable'

import { File } from './File'
import { BotStorage } from './storage/bot/BotStorage'

export class Doc extends File {
  private botStoragesSubject: BehaviorSubject<BotStorage[]>

  public created: Date
  public synchronized: Date
  public botStorages: BotStorage[]

  static deserialize (dbId: string, serialized: any): Doc {
    const doc = new Doc(serialized.key, serialized.title, serialized.location)
    doc.created = serialized.created
    doc.synchronized = serialized.synchronized
    File.deserialize(dbId, serialized, doc)
    return doc
  }

  constructor (key: string, title: string, location?: string) {
    super(key, title, location)
    this.key = key
    this.created = new Date()
    this.synchronized = new Date()
    this.botStorages = []
    this.botStoragesSubject = new BehaviorSubject([])
  }

  get isDoc () { return true }

  get title () {
    return this._title
  }

  set title (newTitle: string) {
    if (!newTitle || newTitle === '') {
      this._title = 'Untitled Document'
    } else {
      this._title = newTitle
    }
  }

  get onBotStorages (): Observable<BotStorage[]> {
    return this.botStoragesSubject.asObservable()
  }

  setBotStorage (bots: BotStorage[]) {
    this.botStorages = bots
    this.botStoragesSubject.next(this.botStorages)
  }

  serialize (): any {
    return Object.assign(super.serialize(), {
      type: 'doc',
      created: this.created,
      synchronized: this.synchronized
    })
  }
}
