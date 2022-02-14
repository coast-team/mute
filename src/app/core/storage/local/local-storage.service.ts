import { Injectable } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { MuteCore, StateStrategy, StateTypes } from '@coast-team/mute-core'
import { filter } from 'rxjs/operators'
import { nanoid } from 'nanoid'

import { environment } from '@environments/environment'
import { IndexdbDatabase } from '../../../doc/logs/IndexdbDatabase'
import { CryptoService } from '../../crypto/crypto.service'
import { Doc } from '../../Doc'
import { File } from '../../File'
import { Folder } from '../../Folder'
import { EProperties } from '../../settings/EProperties.enum'
import { SettingsService } from '../../settings/settings.service'
import { BotStorageService, BotStorageServiceStatus, IMetadata } from '../bot/bot-storage.service'
import { IStorage } from '../IStorage.model'
import { Storage } from '../Storage'
import { EIndexedDBState, getIndexedDBState } from './indexedDBCheck'
import { Subject } from 'rxjs/internal/Subject'

const selectListForDoc = [
  'type',
  'key',
  'signalingKey',
  'cryptoKey',
  'title',
  'titleModified',
  'remotes',
  'parentFolderId',
  'previousParentFolderId',
  'created',
  'opened',
  'modified',
  'modifiedByOthers',
  'description',
  'shareLogs',
  'shareLogsVector',
  'pulsar',
]

const DB_NAME_PREFIX = 'docs-'

@Injectable()
export class LocalStorageService extends Storage implements IStorage {
  
  public static NO_ACCESS = 1
  public static NOT_SUPPORTED = 2

  public local: Folder
  public trash: Folder
  public remote: Folder
  private _route: ActivatedRoute

  private db: any
  private dbLogin: string

  newFileNotifier: Subject<null> = new Subject<null>();
  
  constructor(private botStorage: BotStorageService) {
    super()
    this.local = Folder.create(this, 'Local storage', 'devices', false)
    this.local.id = 'local'
    this.trash = Folder.create(this, 'Trash', 'delete', false)
    this.trash.id = 'trash'

    if (botStorage.status !== BotStorageServiceStatus.UNAVAILABLE) {
      this.remote = Folder.create(this, 'Remote storage', 'cloud', true)
      this.remote.id = botStorage.id
    }
  }

  get route () {
    return this._route
  }

  async init (settings: SettingsService): Promise<void> {
    // Check if available
    const indexedDBState = await getIndexedDBState()

    indexedDBState === EIndexedDBState.OK // eslint-disable-line @typescript-eslint/no-unused-expressions
      ? super.setStatus(LocalStorageService.AVAILABLE)
      : super.setStatus(indexedDBState)

    this.dbLogin = settings.profile.login
    this.openDB(this.dbLogin)
    
    settings.onChange
      .pipe(
        filter((properties) => properties.includes(EProperties.profile))
      )
      .subscribe(() => {
        const login = settings.profile.login
        if (login && this.dbLogin !== login) {
          this.dbLogin = login
          this.openDB(login)
        }
      })
  }

  async save(file: File): Promise<void> {
    this.check()
    return new Promise<void>((resolve, reject) => {
      if (file.id) {
        this.db.put(file.id, file.serialize()).then(
          () => resolve(),
          (err) => reject(err)
        )
      } else {
        this.db.post(file.serialize()).then(
          (id: string) => {
            file.id = id
            resolve()
          },
          (err) => reject(err)
        )
      }
    })
  }

  async move(file: File, folder: Folder): Promise<void> {
    if (file.parentFolderId !== folder.id) {
      file.parentFolderId = folder.id
      return this.save(file)
    }
    return Promise.resolve()
  }

  async delete(file: File): Promise<void> {
    this.check()
    return new Promise<void>((resolve, reject) => {
      if (file.isDoc) {
        const doc = file as Doc
        window.localStorage.removeItem('msgId-401-' + doc.signalingKey)
        window.localStorage.removeItem('msgId-402-' + doc.signalingKey)

        IndexdbDatabase.destroy('muteLogs-' + doc.signalingKey)
      }
      this.db.remove(file.id).then(
        () => resolve(),
        (err: Error) => reject(err)
      )
    })
  }

  async fetchDocs(folder: Folder): Promise<Doc[]> {
    switch (folder.id) {
      case this.local.id: {
        const [localDocs, botDocs] = [await this.fetchDocsFromFolders([this.local]), await this.botStorage.fetchDocs()]
        for (const bd of botDocs) {
          let ld = localDocs.find((d) => d.signalingKey === bd.signalingKey)
          if (ld) {
            this.mergeDocs(ld, bd)
          } else if (!(await this.isInTrash(bd.signalingKey))) {
            ld = await this.createDoc(bd.signalingKey)
            ld.title = bd.title
            ld.titleModified = new Date(bd.titleModified)
            ld.created = new Date(bd.created)
            ld.cryptoKey = bd.cryptoKey
            localDocs.push(ld)
            ld.addRemote(this.remote.id)
          }
        }
        return localDocs
      }
      case this.trash.id: {
        const [trashDocs, botDocs] = [await this.fetchDocsFromFolders([this.trash]), await this.botStorage.fetchDocs()]
        for (const bd of botDocs) {
          const ld = trashDocs.find((d) => d.signalingKey === bd.signalingKey)
          if (ld) {
            this.mergeDocs(ld, bd)
            ld.addRemote(this.remote.id)
          }
        }
        return trashDocs
      }
      case this.remote.id: {
        const botDocs = await this.botStorage.fetchDocs()

        const resultDocs: Doc[] = []
        for (const bd of botDocs) {
          let ld = await this.fetchDoc(bd.signalingKey)
          if (ld) {
            this.mergeDocs(ld, bd)
          } else {
            ld = await this.createDoc(bd.signalingKey)
            ld.title = bd.title
            ld.titleModified = new Date(bd.titleModified)
            ld.created = new Date(bd.created)
            ld.cryptoKey = bd.cryptoKey
          }
          ld.addRemote(this.remote.id)
          resultDocs.push(ld)
        }
        return resultDocs
      }
    }
  }

  async fetchDoc(key: string): Promise<Doc | undefined> {
    this.check()
    const doc = await new Promise<Doc>((resolve, reject) => {
      this.db
        .allDocs({
          query: `(type:"doc") AND (signalingKey:"${key}" OR key:"${key}")`,
          select_list: selectListForDoc,
        })
        .then(
          ({ data }) => {
            if (data) {
              if (data.rows.length === 0) {
                resolve(undefined)
              } else if (data.rows.length === 1) {
                resolve(Doc.deserialize(this, data.rows[0].id, data.rows[0].value))
              } else {
                reject(new Error(`Error fetching doc: more than 1 document exists with the following key: ${key}`))
              }
            }
            resolve(undefined)
          },
          (err) => reject(err)
        )
    })

    // FIXME: remove this code when all clients have updated to the new version
    if (doc) {
      if (doc.signalingKey === doc.cryptoKey) {
        doc.cryptoKey = await CryptoService.generateKey()
      }
    }
    return doc
  }

  async fetchDocContent(doc: Doc): Promise<StateTypes | undefined>

  async fetchDocContent(doc: Doc, blob = false): Promise<StateTypes | Blob | undefined> {
    this.check()
    return await new Promise<StateTypes | Blob | undefined>((resolve, reject) => {
      this.db.getAttachment(doc.id, 'body').then(
        (body) => {
          if (body) {
            if (!blob) {
              const reader = new FileReader()
              reader.onload = () => {
                const a = JSON.parse(reader.result.toString())
                if (a.richLogootSOps) {
                  const state = StateStrategy.emptyState(environment.crdtStrategy)
                  state.remoteOperations = a.richLogootSOps
                  resolve(state)
                } else {
                  a.remoteOperations = a.remoteOperations.map((rop) => {
                    if (typeof rop === 'string') {
                      return JSON.parse(rop)
                    } else {
                      return rop
                    }
                  })
                  const state = StateStrategy.fromPlain(environment.crdtStrategy, a)
                  resolve(state)
                }
              }
              reader.readAsText(body)
            } else {
              resolve(body)
            }
          } else {
            resolve(undefined)
          }
        },
        (err) => reject(err)
      )
    })
  }

  async saveDocContent(doc: Doc, body: StateTypes): Promise<any> {
    doc.modified = new Date()
    await this.save(doc)
    return await new Promise<void>((resolve, reject) => {
      this.db.putAttachment(doc.id, 'body', body.toJSON()).then(
        () => resolve(),
        (err) => reject(err)
      )
    })
  }

  async createDoc(key = this.generateSignalingKey(), title?:string): Promise<Doc> {
    const doc = Doc.create(this, key, await CryptoService.generateKey(), title ||'', this.local.id)
    await this.save(doc)
    return doc
  }

  getFolder(id: string): Folder | undefined {
    switch (id) {
      case this.local.id:
        return this.local
      case this.trash.id:
        return this.trash
      case this.remote.id:
        return this.remote
      default:
        return undefined
    }
  }

  generateSignalingKey(): string {
    return nanoid(10)
  }

  private async isInTrash(key: string): Promise<boolean> {
    return (await new Promise((resolve, reject) => {
      this.db
        .allDocs({
          query: `(signalingKey:"${key}") AND (parentFolderId:"${this.trash.id}") AND (type:"doc")`,
        })
        .then(
          ({ data }: any) => {
            if (data !== undefined && data.rows !== undefined && data.rows.length !== 0) {
              resolve(true)
            } else {
              resolve(false)
            }
          },
          (err) => reject(err)
        )
    })) as boolean
  }

  private async fetchDocsFromFolders(folders: Folder[]): Promise<Doc[]> {
    this.check()
    let query
    if (folders.length === 1) {
      query = `(parentFolderId:"${folders[0].id}")`
    } else {
      query = `(parentFolderId:"${folders[0].id}") OR (parentFolderId:"${folders[1].id}")`
    }
    const docs = (await new Promise((resolve, reject) => {
      this.db.allDocs({ query: `${query} AND (type:"doc")`, select_list: selectListForDoc }).then(
        ({ data }: any) => {
          if (data !== undefined && data.rows !== undefined && data.rows.length !== 0) {
            resolve(data.rows.map((row: any) => Doc.deserialize(this, row.id, row.value)))
          } else {
            resolve([])
          }
        },
        (err) => reject(err)
      )
    })) as Doc[]

    // FIXME: remove this code when all clients have updated to the new version
    for (const doc of docs) {
      if (doc.signalingKey === doc.cryptoKey) {
        doc.cryptoKey = await CryptoService.generateKey()
      }
    }

    return docs
  }

  private openDB(login) {
    if (this.isAvailable) {
      try {
        this.db = jIO.createJIO({
          type: 'query',
          sub_storage: {
            type: 'uuid',
            sub_storage: {
              type: 'indexeddb',
              database: `${DB_NAME_PREFIX}${login}`,
            },
          },
        })
      } catch (err) {
        log.error('Indexed DB error: ', err)
      }
    }
  }

  private check() {
    if (!this.isAvailable) {
      throw new Error('Local storage is unavailable')
    }
  }

  private async mergeDocs(doc: Doc, metadata: IMetadata) {
    const { title, titleModified } = MuteCore.mergeTitle(
      { titleModified: doc.titleModified.getTime(), title: doc.title },
      { titleModified: metadata.titleModified, title: metadata.title }
    )
    doc.title = title
    doc.titleModified = new Date(titleModified)

    const { docCreated, cryptoKey } = MuteCore.mergeFixData(
      { docCreated: doc.created.getTime(), cryptoKey: doc.cryptoKey },
      { docCreated: metadata.created, cryptoKey: metadata.cryptoKey }
    )
    doc.created = new Date(docCreated)
    doc.cryptoKey = cryptoKey
  }
}
