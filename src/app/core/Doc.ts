import { File } from './File'
import { Folder } from './Folder'

export class Doc extends File {
  public key: string
  public remotes: Array<{
    id: string
    synchronized?: Date
  }>

  static deserialize(id: string, serialized: any): Doc {
    const doc = new Doc()
    doc.remotes = serialized.remotes || []
    doc.key = serialized.key
    doc.deserialize(id, serialized)
    return doc
  }

  static create(key: string, title: string, parentFolderId?: string): Doc {
    const doc = new Doc()
    doc.created = new Date()
    doc.key = key
    doc.remotes = []
    doc.init(title, parentFolderId)
    return doc
  }

  constructor() {
    super()
  }

  get isDoc() {
    return true
  }

  get title() {
    return this._title
  }

  set title(newTitle: string) {
    newTitle = newTitle || 'Untitled Document'
    if (this._title !== newTitle) {
      this._title = newTitle
      this.modified = new Date()
    }
  }

  addRemote(id: string) {
    for (const r of this.remotes) {
      if (r.id === id) {
        return false
      }
    }
    this.remotes.push({ id })
    return true
  }

  serialize(): any {
    return Object.assign(super.serialize(), {
      type: 'doc',
      key: this.key,
      remotes: this.remotes,
    })
  }
}
