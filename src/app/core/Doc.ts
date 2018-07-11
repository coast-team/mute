import { ICollaborator, MetaDataMessage, MetaDataType, State } from 'mute-core'
import { FixDataState } from 'mute-core/dist/types/doc/FixDataService'
import { TitleState } from 'mute-core/dist/types/doc/TitleService'
import { Observable, Subject } from 'rxjs'
import { auditTime } from 'rxjs/operators'

import { File } from './File'
import { IStorage } from './storage/IStorage'

const DEFAULT_TITLE = 'Untitled Document'
const METADATA_SAVE_INTERVAL = 1000

export interface IDocContentOperation {
  offset: number
  text?: string // Present only when it is an Insert operation
  length?: number // Present only when it is a Delete operation
  collaborator?: ICollaborator
}

export class Doc extends File {
  public static SIGNALING_KEY = 200
  public static CRYPTO_KEY = 201
  public static REMOTES = 202

  public signalingKey: string
  public cryptoKey: string
  public remotes: Array<{
    id: string
    synchronized?: Date
  }>
  public localContentChanges: Subject<IDocContentOperation[]>
  public remoteContentChanges: Subject<IDocContentOperation[]>

  static deserialize(storage: IStorage, id: string, serialized: any): Doc {
    const doc = new Doc(storage, serialized.title, serialized.parentFolderId)
    doc.remotes = serialized.remotes || []

    // FIXME: remove this 'if' statement when all clients have updated to the new version
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

  static create(storage: IStorage, signalingKey: string, cryptoKey: string, title: string, parentFolderId?: string): Doc {
    const doc = new Doc(storage, title, parentFolderId)
    doc.created = new Date()
    doc.signalingKey = signalingKey
    doc.cryptoKey = cryptoKey
    doc.remotes = []
    return doc
  }

  constructor(storage: IStorage, title: string, parentFolderId?: string) {
    super(storage, title, parentFolderId)
    this.localContentChanges = new Subject()
    this.remoteContentChanges = new Subject()
    this._title = title || DEFAULT_TITLE
    this.changes.pipe(auditTime(METADATA_SAVE_INTERVAL)).subscribe(() => this.saveMetadata())
  }

  get isDoc() {
    return true
  }

  get title() {
    return this._title
  }

  set title(newTitle: string) {
    newTitle = newTitle || DEFAULT_TITLE
    this.updateTitle(newTitle, true)
  }

  get description() {
    return this._description
  }

  set description(description: string) {
    this.updateDescription(description, true)
  }

  async saveMetadata() {
    await this.storage.save(this)
  }

  setRemoteMetadataUpdateSource(source: Observable<MetaDataMessage>) {
    source.subscribe(({ type, data }) => {
      switch (type) {
        case MetaDataType.Title:
          const { title, titleModified } = data as TitleState
          this.updateTitle(title, false, new Date(titleModified))
          break
        case MetaDataType.FixData:
          const { docCreated, cryptoKey } = data as FixDataState
          this.created = new Date(docCreated)
          this.cryptoKey = cryptoKey
          this.changes.next({ isLocal: false, changedProperties: [Doc.CREATED, Doc.CRYPTO_KEY] })
          break
      }
    })
  }

  addRemote(id: string) {
    for (const r of this.remotes) {
      if (r.id === id) {
        return
      }
    }
    this.remotes.push({ id })
    this.changes.next({ isLocal: false, changedProperties: [Doc.REMOTES] })
  }

  serialize(): any {
    return Object.assign(super.serialize(), {
      type: 'doc',
      signalingKey: this.signalingKey,
      cryptoKey: this.cryptoKey,
      remotes: this.remotes,
    })
  }

  dispose() {
    super.dispose()
    this.localContentChanges.complete()
    this.remoteContentChanges.complete()
  }

  async saveContent(content: State) {
    await this.storage.saveDocContent(this, content)
  }

  async fetchContent(): Promise<object> {
    return this.storage.fetchDocContent(this)
  }

  private updateTitle(newTitle: string, isLocal: boolean, titleModified = new Date()) {
    if (this._title !== newTitle) {
      const changedProperties = [Doc.TITLE, Doc.TITLE_MODIFIED, Doc.MODIFIED]
      this._title = newTitle
      this.titleModified = titleModified
      if (isLocal) {
        this.modified = new Date()
      } else {
        this.modifiedByOthers = new Date()
        changedProperties.push(Doc.MODIFIED_BY_OTHERS)
      }
      this.changes.next({ isLocal, changedProperties })
    }
  }

  private updateDescription(newDescription: string, isLocal: boolean) {
    if (this.description !== newDescription) {
      const changedProperties = [Doc.DESCRIPTION, Doc.MODIFIED]
      this._description = newDescription
      if (isLocal) {
        this.modified = new Date()
      } else {
        this.modifiedByOthers = new Date()
        changedProperties.push(Doc.MODIFIED_BY_OTHERS)
      }
      this.changes.next({ isLocal, changedProperties })
    }
  }
}
