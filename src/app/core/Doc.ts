import { MetaDataMessage, MetaDataType } from 'mute-core'
import { Observable, Subject } from 'rxjs'
import { File } from './File'

export class Doc extends File {
  public signalingKey: string
  public cryptoKey: string
  public remotes: Array<{
    id: string
    synchronized?: Date
  }>
  private titleSubject: Subject<MetaDataMessage>
  private docChangeSubject: Subject<MetaDataType>

  static deserialize(id: string, serialized: any): Doc {
    const doc = new Doc()
    doc.remotes = serialized.remotes || []
    if (serialized.key) {
      doc.signalingKey = serialized.key
      doc.cryptoKey = serialized.key
    } else {
      doc.signalingKey = serialized.signalingKey
      doc.cryptoKey = serialized.cryptoKey
    }
    doc.deserialize(id, serialized)
    return doc
  }

  static create(signalingKey: string, cryptoKey: string, title: string, parentFolderId?: string): Doc {
    const doc = new Doc()
    doc.created = new Date()
    doc.signalingKey = signalingKey
    doc.cryptoKey = cryptoKey
    doc.remotes = []
    doc.init(title, parentFolderId)
    return doc
  }

  constructor() {
    super()
    this.titleSubject = new Subject<MetaDataMessage>()
    this.docChangeSubject = new Subject<MetaDataType>()
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
      this.titleSubject.next({ type: MetaDataType.Title, data: this._title })
    }
  }

  get onTitleChange(): Observable<MetaDataMessage> {
    return this.titleSubject.asObservable()
  }

  get onDocChange(): Observable<MetaDataType> {
    return this.docChangeSubject
  }

  set onRemoteDocChange(source: Observable<MetaDataMessage>) {
    source.subscribe((message: MetaDataMessage) => {
      switch (message.type) {
        case MetaDataType.Title:
          const newTitle = message.data
          this._title = newTitle
          this.modified = new Date()
          this.docChangeSubject.next(message.type)
          break
        case MetaDataType.FixData:
          this.created = new Date(message.data.creationDate)
          this.cryptoKey = message.data.key
          this.docChangeSubject.next(message.type)
          break
      }
    })
  }

  dispose() {
    this.titleSubject.complete()
    this.docChangeSubject.complete()
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
      signalingKey: this.signalingKey,
      cryptoKey: this.cryptoKey,
      remotes: this.remotes,
    })
  }
}
