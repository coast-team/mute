import { Injectable } from '@angular/core'
import { State } from 'mute-core'

import { Doc } from '../Doc'
import { File } from '../File'
import { Folder } from '../Folder'

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

@Injectable()
export class StorageService {
  private db: any

  public root: Folder
  public home: Folder
  public trash: Folder

  constructor () {
    this.root = new Folder('/', '', '')
    this.home = new Folder('home', 'All documents', 'view_module', this.root.route)
    this.trash = new Folder('trash', 'Trash', 'delete', this.root.route)
    this.db = jIO.createJIO({
      type: 'query',
      sub_storage: {
        type: 'uuid',
        sub_storage: {
          type: 'indexeddb',
          database: 'muteDocuments'
        }
      }
    })
    this.searchFolder(this.home.route)
      .then((folder: Folder) => this.home.dbId = folder.dbId)
      .catch(() => this.createFile(this.home))
    this.searchFolder(this.trash.route)
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

  moveDoc (doc: Doc, location: string): Promise<undefined> {
    if (doc.location !== location)  {
      doc.location = location
      return this.updateFile(doc)
    }
    return Promise.resolve()
  }

  searchDoc (key: string): Promise<Doc[]> {
    return new Promise((resolve, reject) => {
      this.db.allDocs({
        query: `(type:"doc") AND (key:"${key}")`,
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

  createDoc (key = this.generateKey()) {
    const doc = new Doc(key, 'Untitled Document', this.home.route)
    this.createFile(doc)
    return doc
  }

  private generateKey (): string {
    const MIN_LENGTH = 10
    const DELTA_LENGTH = 0
    const MASK = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let key = ''
    const length = MIN_LENGTH + Math.round(Math.random() * DELTA_LENGTH)

    for (let i = 0; i < length; i++) {
      key += MASK[Math.round(Math.random() * (MASK.length - 1))]
    }
    return key
  }

}
