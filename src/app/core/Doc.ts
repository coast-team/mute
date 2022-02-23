import { FixDataState, ICollaborator, MetaDataMessage, MetaDataType, State, StateTypes, TitleState } from '@coast-team/mute-core'
import { Observable, Subject } from 'rxjs'

import { PulsarState } from '@coast-team/mute-core'
import { LogState } from '@coast-team/mute-core'
import { File } from './File'
import { IStorage } from './storage/IStorage.model'
import { muteConsts } from '@app/shared/muteConsts'

const DEFAULT_TITLE = 'Untitled Document'

export interface IDocContentOperation {
  index: number
  text?: string // Present only when it is an Insert operation
  length?: number // Present only when it is a Delete operation
  collaborator?: ICollaborator
}

export class Doc extends File {
  public static SIGNALING_KEY = 200
  public static CRYPTO_KEY = 201
  public static REMOTES = 202
  public static SHARE_LOGS = 203
  public static SHARE_LOGS_VECTOR = 204
  public static PULSAR = 205

  public signalingKey: string
  public cryptoKey: string
  public remotes: {
    id: string
    synchronized?: Date
  }[]
  public localContentChanges: Subject<IDocContentOperation[]>
  public remoteContentChanges: Subject<IDocContentOperation[]>

  private _shareLogs: boolean
  private _shareLogsVector: Map<number, number>

  private _pulsar: boolean

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
    doc._shareLogs = serialized.shareLogs
    doc._shareLogsVector = serialized.shareLogsVector
    doc._pulsar = serialized.pulsar

    doc.deserialize(id, serialized)
    return doc
  }

  static create(storage: IStorage, signalingKey: string, cryptoKey: string, title: string, parentFolderId?: string, typeDocument?: string): Doc {
    const doc = new Doc(storage, title, parentFolderId)
    doc.created = new Date()
    doc.signalingKey = signalingKey
    doc.cryptoKey = cryptoKey
    doc.remotes = []
    this.setDocumentType(doc, typeDocument)
    return doc
  }

  constructor(storage: IStorage, title: string, parentFolderId?: string) {
    super(storage, DEFAULT_TITLE, parentFolderId)
    
    this.localContentChanges = new Subject<IDocContentOperation[]>()
    this.remoteContentChanges = new Subject<IDocContentOperation[]>()

    if (title) {
      this._title = title
      this.titleModified = new Date()
    }
    
    this._shareLogs = false
    this._shareLogsVector = new Map()
    this._pulsar = false
  }

  /**
   * Set the type of document depending on the choice of the user
   */
   static setDocumentType(doc: Doc, typeDoc:string){
    switch (typeDoc){
      case muteConsts.isWithoutBotStorage:
        break
      case muteConsts.isWithPulsar:
        doc._pulsar=true
        break
      case muteConsts.defaultTypeDocument:
        break
    }
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

  get shareLogs() {
    return this._shareLogs
  }

  set shareLogs(newShareLogs: boolean) {
    this.updateShareLogs(newShareLogs, true)
  }

  get shareLogsVector() {
    return this._shareLogsVector
  }

  get pulsar() {
    return this._pulsar
  }

  set pulsar(newPulsar: boolean) {
    this.updatePulsar(newPulsar, true)
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
        case MetaDataType.Logs:
          const { share, vector } = data as LogState
          this.updateShareLogs(share, false)
          this._shareLogsVector = vector
          this.changes.next({ isLocal: false, changedProperties: [Doc.SHARE_LOGS, Doc.SHARE_LOGS_VECTOR] })
          break
        case MetaDataType.Pulsar:
          const { activatePulsar } = data as PulsarState
          this.updatePulsar(activatePulsar, false)
          this.changes.next({ isLocal: false, changedProperties: [Doc.PULSAR] })
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
      shareLogs: this._shareLogs,
      shareLogsVector: this._shareLogsVector,
      pulsar: this._pulsar,
    })
  }

  dispose() {
    super.dispose()
    this.localContentChanges.complete()
    this.remoteContentChanges.complete()
  }

  async saveContent(content: StateTypes) {
    await this.storage.saveDocContent(this, content)
  }

  async fetchContent(blob = false): Promise<StateTypes | Blob | undefined> {
    return this.storage.fetchDocContent(this, blob)
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

  private updateShareLogs(newShareLogs: boolean, isLocal: boolean) {
    if (this._shareLogs !== newShareLogs) {
      const changedProperties = [Doc.SHARE_LOGS]
      this._shareLogs = newShareLogs
      this.changes.next({ isLocal, changedProperties })
    }
  }

  private updatePulsar(newPulsar: boolean, isLocal: boolean) {
    if (this._pulsar !== newPulsar) {
      const changedProperties = [Doc.PULSAR]
      this._pulsar = newPulsar
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
