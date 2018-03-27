import { File } from './File'
import { Folder } from './Folder'

export class Doc extends File {

  public key: string
  public remotes: Array<{
    id: string,
    synchronized?: Date
  }>

  static deserialize (id: string, serialized: any): Doc {
    const doc = new Doc(serialized.key, serialized.title, serialized.parentFolderId)
    doc.remotes = serialized.remotes || []
    doc.key = serialized.key
    File.deserialize(id, serialized, doc)
    return doc
  }

  constructor (key: string, title: string, parentFolderId?: string, remoteLocations?: string[]) {
    super(title, parentFolderId)
    this.key = key
    this.remotes = []
    this.created = new Date()
  }

  get isDoc () { return true }

  get title () { return this._title }

  set title (newTitle: string) {
    this._title = newTitle || 'Untitled Document'
  }

  addRemote (id: string) {
    for (const r of this.remotes) {
      if (r.id === id) {
        return false
      }
    }
    this.remotes.push({ id })
    return true
  }

  serialize (): any {
    return Object.assign(super.serialize(), {
      type: 'doc',
      key: this.key,
      remotes: this.remotes
    })
  }
}
