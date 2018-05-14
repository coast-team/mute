import { Injectable } from '@angular/core'
import { State } from 'mute-core'

import { Doc } from '../Doc'
import { File } from '../File'
import { Folder } from '../Folder'
import { ProfileService } from '../profile/profile.service'

const selectList = [
  'type',
  'key',
  'title',
  'location',
  'previousLocation',
  'shareLogs',
  'icon',
  'route',
  'created',
  'synchronized',
]

@Injectable()
export class StorageService {
  private db: any

  public home: Folder
  public trash: Folder

  constructor () {
    this.home = new Folder('home', 'All documents', 'view_module')
    this.trash = new Folder('trash', 'Trash', 'delete')
  }

  async init (profileService: ProfileService): Promise<void> {
    this.setDb(profileService.profile.login)
    profileService.onChange.subscribe((profile) => this.setDb(profile.login))
    await this.searchFolder(this.home.route)
      .then((folder: Folder) => this.home.dbId = folder.dbId)
      .catch(() => this.createFile(this.home)),
      await this.searchFolder(this.trash.route)
        .then((folder: Folder) => this.trash.dbId = folder.dbId)
        .catch(() => this.createFile(this.trash))
  }

  getRootFolders (): Folder[] {
    return [this.home, this.trash]
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
        .then(({ data }: any) => {
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
    if (doc.location !== location) {
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

  getDocBody (doc: Doc): Promise<any> {
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

  saveDocBody (doc: Doc, body: State): Promise<any> {
    return this.updateFile(doc)
      .then(() => new Promise((resolve, reject) => {
        this.db.putAttachment(doc.dbId, 'body', JSON.stringify(body))
          .then(() => resolve(), (err) => reject(err))
      }))
  }

  deleteDoc (doc: Doc): Promise<undefined> {
    return new Promise((resolve, reject) => {
      this.db.remove(doc.dbId).then(() => resolve(), (err) => reject(err))
    })
  }

  createDoc (key = this.generateKey()) {
    const doc = new Doc(key, 'Untitled Document', this.home.route)
    this.createFile(doc)
    return doc
  }

  generateKey (): string {
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

  private setDb (login: string) {
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
  }

}
