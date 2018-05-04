import { Injectable } from '@angular/core'
import { State } from 'mute-core'
import { AsyncSubject } from 'rxjs/AsyncSubject'
import { Observable } from 'rxjs/Observable'
import { filter } from 'rxjs/operators'

import { SymmetricCryptoService } from '../../crypto/symmetric-crypto.service'
import { Doc } from '../../Doc'
import { File } from '../../File'
import { Folder } from '../../Folder'
import { EProperties } from '../../settings/EProperties'
import { SettingsService } from '../../settings/settings.service'
import { IStorage } from '../IStorage'

const selectList = [
  'type',
  'key',
  'title',
  'location',
  'previousLocation',
  'icon',
  'route',
  'created',
  'synchronized',
]

export enum LocalStorageStatus {
  AVAILABLE
}

@Injectable()
export class LocalStorageService implements IStorage {

  public local: Folder
  public trash: Folder
  public status: LocalStorageStatus.AVAILABLE

  private db: any
  private dbLogin: string
  private statusSubject: AsyncSubject<LocalStorageStatus>

  constructor (settings: SettingsService, private symCrypto: SymmetricCryptoService) {
    this.local = new Folder('local', 'Local storage', 'computer')
    this.trash = new Folder('trash', 'Trash', 'delete')
    this.statusSubject = new AsyncSubject()
    this.statusSubject.next(LocalStorageStatus.AVAILABLE)
    this.dbLogin = settings.anonymous.login
    this.openDB(this.dbLogin)
    settings.onChange.pipe(
      filter((properties) => properties.includes(EProperties.profile))
    ).subscribe(() => {
      const login = settings.profile.login
      if (login && this.dbLogin !== login) {
        this.dbLogin = login
        this.openDB(login)
        this.searchFolder(this.local.route)
          .then((folder: Folder) => this.local.dbId = folder.dbId)
          .catch(() => this.createFile(this.local)),
        this.searchFolder(this.trash.route)
          .then((folder: Folder) => this.trash.dbId = folder.dbId)
          .catch(() => this.createFile(this.trash))
      }
    })
  }

  get onStatusChange (): Observable<LocalStorageStatus> {
    return this.statusSubject.asObservable()
  }

  getDocs (folder: Folder): Promise<Doc[]> {
    return this.getFiles(folder) as Promise<Doc[]>
  }

  getFiles (folder: Folder): Promise<File[]> {
    return new Promise((resolve, reject) => {
      this.db.allDocs({ query: `(location:"${folder.route}")`, select_list: selectList })
        .then(({ data }: any) => {
          if (data !== undefined && data.rows !== undefined && data.rows.length !== 0) {
            resolve(data.rows.map((row: any) => {
              if (row.value.type === 'doc') {
                return Doc.deserialize(row.id, row.value)
              } else {
                return Folder.deserialize(row.id, row.value)
              }
            }))
          } else {
            resolve([])
          }
        },
          (err) => reject(err)
        )
    })
  }

  searchFolder (route: string): Promise<Folder> {
    return new Promise((resolve, reject) => {
      this.db.allDocs({ query: `(route:"${route}")`, select_list: selectList })
        .then(({data}: any) => {
          if (data.rows.length !== 0) {
            const row = data.rows[0]
            resolve(Folder.deserialize(row.id, row.value))
          }
          reject(new Error(`Folder "${route}" not found`))
        },
          (err) => reject(err)
        )
    })
  }

  updateFile (file: File): Promise<undefined> {
    return new Promise((resolve, reject) => {
      this.db.put(file.dbId, file.serialize())
        .then(() => resolve(), (err) => reject(err))
    })
  }

  createFile (file: File): Promise<undefined> {
    return new Promise((resolve, reject) => {
      this.db.post(file.serialize())
        .then((dbId: string) => {
          file.dbId = dbId
          resolve()
        }, (err) => reject(err))
    })
  }

  getFile (dbId: string): Promise<File> {
    return new Promise((resolve, reject) => {
      this.db.get(dbId)
        .then(
          (serialized: any) => {
            if (serialized.type === 'doc') {
              resolve(Doc.deserialize(dbId, serialized))
            } else {
              resolve(Folder.deserialize(dbId, serialized))
            }
          },
          (err) => reject(err)
        )
    })
  }

  moveDoc (doc: Doc, location: string): Promise<void> {
    if (doc.location !== location)  {
      doc.location = location
      return this.updateFile(doc)
    }
    return Promise.resolve()
  }

  async searchDoc (key: string): Promise<Doc[]> {
    return new Promise<Doc[]>((resolve, reject) => {
      this.db.allDocs({
        query: `(type:"doc") AND (key:"${key}") AND NOT (location:"trash")`,
        select_list: selectList
      })
        .then(({ data }: any) => {
          if (data !== undefined && data.rows.length !== 0) {
            resolve(data.rows.map((row: any) => Doc.deserialize(row.id, row.value)))
          }
          resolve([])
        },
          (err) => reject(err)
        )
    })
  }

  getDocBody (doc: Doc): Promise <any> {
    return new Promise((resolve, reject) => {
      this.db.getAttachment(doc.dbId, 'body')
        .then(
          (body) => {
            const reader = new FileReader()
            reader.onload = () => {
              const json = JSON.parse(reader.result)
              resolve(json)
            }
            reader.readAsText(body)
          },
          (err) => reject(err)
        )
    })
  }

  async getDocBodyAsBlob (key: string): Promise<Blob> {
    const docs: Doc[] = await this.searchDoc(key)
    if (docs.length === 0) {
      throw new Error('Document not found')
    } else if (docs.length > 1) {
      throw new Error('Too many documents found')
    }
    const doc: Doc = docs[0]
    return this.db.getAttachment(doc.dbId, 'body')
  }

  saveDocBody (doc: Doc, body: State): Promise <any> {
    return this.updateFile(doc)
      .then(() => new Promise((resolve, reject) => {
        this.db.putAttachment(doc.dbId, 'body', JSON.stringify(body))
          .then(() => resolve(), (err) => reject(err))
      }))
  }

  deleteDoc (doc: Doc): Promise <undefined> {
    return new Promise((resolve, reject) => {
      this.db.remove(doc.dbId).then(() => resolve(), (err) => reject(err))
    })
  }

  createDoc (key) {
    const doc = new Doc(key, 'Untitled Document', this.local.route)
    this.createFile(doc)
    return doc
  }

  generateKey (): Promise<string> {
    return this.symCrypto.generateKey()
  }

  private openDB (login) {
    try {
      this.db = jIO.createJIO({
        type: 'query',
        sub_storage: {
          type: 'uuid',
          sub_storage: {
            type: 'indexeddb',
            database: `documents_v0.4.0-${login}`
          }
        }
      })
    } catch (err) {
      log.debug('Indexed DB error: ', err)
    }
  }

}
