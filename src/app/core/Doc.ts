import { Folder } from './Folder'
import { File } from './File'

export class Doc extends File {
  public created: Date
  public synchronized: Date

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

  serialize (): any {
    return Object.assign(super.serialize(), {
      type: 'doc',
      created: this.created,
      synchronized: this.synchronized
    })
  }
}
