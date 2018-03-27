import { Injectable } from '@angular/core'
import { State } from 'mute-core'
import { AsyncSubject } from 'rxjs/AsyncSubject'
import { Observable } from 'rxjs/Observable'
import { filter } from 'rxjs/operators'

import { Doc } from '../../Doc'
import { File } from '../../File'
import { Folder } from '../../Folder'
import { EProperties } from '../../settings/EProperties'
import { SettingsService } from '../../settings/settings.service'
import { BotStorageService } from '../bot/bot-storage.service'
import { Storage } from '../Storage'
import { EIndexedDBState, getIndexedDBState } from './indexedDBCheck'

const selectListForDoc = [
  'type',
  'key',
  'title',
  'remotes',
  'parentFolderId',
  'previousParentFolderId',
  'created',
  'opened',
  'modified',
  'description',
]

@Injectable()
export class LocalStorageService extends Storage {

  public static NO_ACCESS = 1
  public static NOT_SUPPORTED = 2

  public local: Folder
  public trash: Folder

  private db: any
  private dbLogin: string

  constructor (
    private botStorage: BotStorageService
  ) {
    super()
    this.local = new Folder('Local storage', 'devices')
    this.local.id = 'local'
    this.trash = new Folder('Trash', 'delete')
    this.trash.id = 'trash'
  }

  async init (settings: SettingsService): Promise<void> {
    // Check if available
    const indexedDBState = await getIndexedDBState()
    if (indexedDBState === EIndexedDBState.OK) {
      super.setStatus(LocalStorageService.AVAILABLE)
    } else {
      super.setStatus(indexedDBState)
    }
    this.dbLogin = settings.profile.login
    this.openDB(this.dbLogin)
    settings.onChange.pipe(
      filter((properties) => properties.includes(EProperties.profile))
    ).subscribe(() => {
      const login = settings.profile.login
      if (login && this.dbLogin !== login) {
        this.dbLogin = login
        this.openDB(login)
      }
    })
  }

  async save (file: File): Promise<void> {
    this.check()
    await new Promise((resolve, reject) => {
      if (file.id) {
        this.db.put(file.id, file.serialize())
          .then(() => resolve(), (err) => reject(err))
      } else {
        this.db.post(file.serialize())
          .then((id: string) => {
            file.id = id
            resolve()
          }, (err) => reject(err))
      }
    })
  }

  move (file: File, folder: Folder): Promise<void> {
    if (file.parentFolderId !== folder.id) {
      file.parentFolderId = folder.id
      return this.save(file)
    }
    return Promise.resolve()
  }

  async delete (file: File): Promise<void> {
    this.check()
    await new Promise((resolve, reject) => {
      this.db.remove(file.id).then(() => resolve(), (err) => reject(err))
    })
  }

  async getDocs (folder: Folder): Promise<Doc[]> {

    if (folder.id === this.local.id || folder.id === this.trash.id) {
      const docs = await this.fetchDocs([folder])

      const remoteKeys = await this.botStorage.fetchDocs()

      for (const key of remoteKeys) {
        let doc
        for (const d of docs) {
          if (d.key === key) {
            doc = d
            break
          }
        }
        if (folder.id === this.local.id) {

          if (!doc && !await this.isInTrash(key)) {
            doc = new Doc(key, '', this.local.id)
            docs.push(doc)
          }
          if (doc && doc.addRemote(this.botStorage.remote.id)) {
            this.save(doc)
          }
        } else {
          if (doc && doc.addRemote(this.botStorage.remote.id)) {
            this.save(doc)
          }
        }

      }
      return docs
    } else if (folder.id === this.botStorage.remote.id) {
      const docs = await this.fetchDocs([this.local, this.trash])

      const remoteKeys = await this.botStorage.fetchDocs()

      const resultDocs = []
      remoteKeys.forEach((key) => {
        let doc
        for (const d of docs) {
          if (d.key === key) {
            doc = d
            break
          }
        }
        if (!doc) {
          doc = new Doc(key, '', this.local.id)
        }
        if (doc.addRemote(this.botStorage.remote.id)) {
          this.save(doc)
        }
        resultDocs.push(doc)
      })
      return resultDocs
    }
  }

  async lookupDoc (key: string): Promise<Doc[]> {
    this.check()
    return await new Promise<Doc[]>((resolve, reject) => {
      this.db.allDocs({
        query: `(type:"doc") AND (key:"${key}") AND NOT (parentFolderId:"${this.trash.id}")`,
        select_list: selectListForDoc
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

  async getDocBody (doc: Doc): Promise<object> {
    this.check()
    return await new Promise((resolve, reject) => {
      this.db.getAttachment(doc.id, 'body')
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
    const docs: Doc[] = await this.lookupDoc(key)
    if (docs.length === 0) {
      throw new Error('Document not found')
    } else if (docs.length > 1) {
      throw new Error('Too many documents found')
    }
    this.check()
    return await new Promise((resolve, reject) => {
      this.db.getAttachment(docs[0].id, 'body')
    }) as Blob
  }

  async saveDocBody (doc: Doc, body: State): Promise <any> {
    await this.save(doc)
    return await new Promise((resolve, reject) => {
      this.db.putAttachment(doc.id, 'body', JSON.stringify(body))
        .then(() => resolve(), (err) => reject(err))
    })
  }

  async createDoc (key = this.generateKey()): Promise<Doc> {
    const doc = new Doc(key, '', this.local.id)
    await this.save(doc)
    return doc
  }

  lookupFolder (id: string): Folder | undefined {
    switch (id) {
    case this.local.id:
      return this.local
    case this.trash.id:
      return this.trash
    case this.botStorage.remote.id:
      return this.botStorage.remote
    default:
      return undefined
    }
  }

  private async isInTrash (key: string): Promise<boolean> {
    return await new Promise((resolve, reject) => {
      this.db.allDocs({
        query: `(key:"${key}") AND (parentFolderId:"${this.trash.id}") AND (type:"doc")`
      })
        .then(({ data }: any) => {
          if (data !== undefined && data.rows !== undefined && data.rows.length !== 0) {
            resolve(true)
          } else {
            resolve(false)
          }
        },
        (err) => reject(err)
        )
    }) as boolean
  }

  private async fetchDocs (folders: Folder[]): Promise<Doc[]> {
    this.check()
    let query
    if (folders.length === 1) {
      query = `(parentFolderId:"${folders[0].id}")`
    } else {
      query = `(parentFolderId:"${folders[0].id}") OR (parentFolderId:"${folders[1].id}")`
    }
    return await new Promise((resolve, reject) => {
      this.db.allDocs({ query: `${query} AND (type:"doc")`, select_list: selectListForDoc })
        .then(({ data }: any) => {
          if (data !== undefined && data.rows !== undefined && data.rows.length !== 0) {
            resolve(data.rows.map((row: any) => Doc.deserialize(row.id, row.value)))
          } else {
            resolve([])
          }
        },
        (err) => reject(err)
        )
    }) as Doc[]
  }

  private generateKey (): string {
    const mask = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const length = 42 // Should be less then MAX_KEY_LENGTH value
    const values = new Uint32Array(length)
    window.crypto.getRandomValues(values)
    let result = ''
    for (let i = 0; i < length; i++) {
      result += mask[values[i] % mask.length]
    }
    return result
  }

  private openDB (login) {
    if (this.isAvailable) {
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
        log.error('Indexed DB error: ', err)
      }
    }
  }

  private check () {
    if (!this.isAvailable) {
      throw new Error('Local storage is unabailable')
    }
  }

}
