import { Injectable } from '@angular/core'
import { ReplaySubject, Observable } from 'rxjs/Rx'

import { StorageServiceInterface } from '../StorageServiceInterface'
import { File } from '../../File'
import { Doc, DocSerialize } from '../../Doc'
import { Folder } from '../../Folder'

@Injectable()
export class LocalStorageService implements StorageServiceInterface {
  private db: any

  public home: Folder
  public trash: Folder

  constructor () {
    this.home = new Folder('local', 'Local Storage', 'computer', this)
    this.trash = new Folder('trash', 'Trash', 'delete', this)
    this.db = jIO.createJIO({
      type: 'query',
      sub_storage: {
        type: 'indexeddb',
        database: 'mute'
      }
    })
  }

  get (key: string): Promise<Doc> {
    return new Promise((resolve, reject) => {
      this.db.get(key)
        .then(
          (docSer: DocSerialize) => {
            log.debug('doc serialize: ', docSer)
            if (docSer.localFolderId === 'local') {
              resolve(Doc.deserialize(docSer, this, this.home))
            } else if (docSer.localFolderId === 'trash') {
              resolve(Doc.deserialize(docSer, this, this.trash))
            } else {
              reject(new Error('Cannot find document ' + key))
            }
          },
          (err) => reject(err)
        )
    })
  }

  getBody (doc: Doc): Promise < any > {
    return new Promise((resolve, reject) => {
      log.debug('getBody doc id: ' + doc.id)
      this.db.getAttachment(doc.id, 'body')
        .then(
          (body) => {
            const reader = new FileReader()
            reader.onload = (event) => {
              const json = JSON.parse(reader.result)
              resolve(json)
            }
            reader.readAsText(body)
          },
          (err) => reject(err)
        )
    })
  }

  save (doc: Doc, body?: any): Promise < any > {
    return new Promise((resolve, reject) => {
      if (doc.localFolder !== this.home && doc.localFolder !== this.trash) {
        doc.localFolder = this.home
      }
      this.db.put(doc.id, doc.serialize())
        .then(
          () => {
            if (body !== undefined) {
              this.db.putAttachment(doc.id, 'body', JSON.stringify(body))
                .then(
                  () => resolve(),
                  (err) => reject(err)
                )
            }
            log.debug('Save doc')
            resolve()
          },
          (err) => reject(err)
        )
    })
  }

  delete (doc: Doc): Promise < any > {
    if (doc.localFolder === this.home) {
      doc.localFolder = this.trash
      return doc.save()
    }
    return new Promise((resolve, reject) => {
      this.db.remove(doc.id)
        .then(
          () => resolve(),
          (err) => reject(err)
        )
    })
  }

  deleteFiles (folder: Folder): Promise<any> {
    return new Promise((resolve, reject) => {
      if (folder.id === 'local') {
        this.db.allDocs({
          query: `localFolderId:"local"`,
          select_list: ['id', 'title', 'bot', 'localFolderId', 'icon']
        })
          .then((response) => response.data.rows)
          .then(
            (data: Object[]) => {
              data.forEach((obj: any) => {
                obj.value.localFolderId = 'trash'
                this.db.put(obj.value.id, obj.value)
              })
              resolve()
            },
            (err) => reject(err)
          )
      } else {
        this.db.allDocs({
          query: `localFolderId:"trash"`,
          select_list: ['id']
        })
          .then((response) => response.data.rows)
          .then(
            (data: Object[]) => {
              data.forEach(({id}: {id: string}) => {
                this.db.remove(id)
              })
              resolve()
            },
            (err) => reject(err)
          )
      }
    })
  }

  fetchFiles (folder: Folder): Promise<Doc[]> {
    return new Promise((resolve, reject) => {
      this.db.allDocs({
        query: `localFolderId:"${folder.id}"`,
        select_list: ['id', 'title', 'bot', 'localFolderId', 'icon']
      })
        .then((response) => response.data.rows)
        .then(
          (rows) => {
            const docs: Doc[] = []
            rows.forEach((obj) => {
              // Old version compatibility fix
              if (obj.folderId) {
                obj.localFolderId = obj.folderId
              }
              docs.push(Doc.deserialize(obj.value, this, folder))
            })
            resolve(docs)
          },
          (err) => reject(err)
        )
    })
  }

  createDoc (key = this.generateKey()) {
    const doc = new Doc(key, 'Untitled Document', this, this.home)
    doc.save()
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
