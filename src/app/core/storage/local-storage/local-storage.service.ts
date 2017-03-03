import { Injectable } from '@angular/core'
import { ReplaySubject, Observable } from 'rxjs/Rx'

import { AbstractStorageService } from '../AbstractStorageService'
import { File } from '../../File'
import { Folder } from '../../Folder'
import { Doc } from '../../Doc'

@Injectable()
export class LocalStorageService extends AbstractStorageService {

  private db: any

  public home: Folder
  public trash: Folder

  constructor () {
    super()
    this.home = new Folder('local', 'Local Storage', '', this, 'computer')
    this.trash = new Folder('trash', 'Trash', '', this, 'delete')
    this.db = jIO.createJIO({
      type: 'query',
      sub_storage: {
        type: 'indexeddb',
        database: 'mute'
      }
    })
  }

  getRootFolders (): Promise<Folder[]> {
    return Promise.resolve([this.home])
  }

  get (key: string): Promise<Doc> {
    return new Promise((resolve, reject) => {
      this.db.get(key)
        .then(
          (data) => {
            log.debug('get doc: ', data)
            resolve(Doc.deserialize(data, this))
          },
          (err) => reject(err)
        )
    })
  }

  getBody (doc: Doc): Promise < any > {
    return new Promise((resolve, reject) => {
      this.db.getAttachment(doc.id, 'body')
        .then(
          (body) => resolve(JSON.parse(body)),
          (err) => reject(err)
        )
    })
  }

  save (doc: Doc, body?: any): Promise < any > {
    return new Promise((resolve, reject) => {
      this.db.put(doc.id, doc.serialize())
        .then(
          () => {
            log.debug('Saved: ', doc.serialize())
            if (body !== undefined) {
              this.db.putAttachment(doc.id, 'body', JSON.stringify(body))
                .then(
                  () => resolve(),
                  (err) => reject(err)
                )
            }
            resolve()
          },
          (err) => reject(err)
        )
    })
  }

  delete (doc: Doc): Promise < any > {
    log.debug('deleting: ', doc)
    if (doc.parentId === 'local') {
      doc.parentId = 'trash'
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

  deleteAll (folder: Folder): Promise<any> {
    return new Promise((resolve, reject) => {
      if (folder.id === 'local') {
        this.db.allDocs({
          query: `parentId:"local"`,
          select_list: ['id', 'title', 'parentId', 'botContacts', 'icon']
        })
          .then((response) => response.data.rows)
          .then(
            (data: Object[]) => {
              data.forEach((obj: any) => {
                obj.value.parentId = 'trash'
                log.debug('Moving the document into trash: ', obj)
                this.db.put(obj.value.id, obj.value)
              })
              resolve()
            },
            (err) => reject(err)
          )
      } else {
        this.db.allDocs({
          query: `parentId:"trash"`,
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

  getFiles (folder: Folder): Promise < Doc[] > {
    return new Promise((resolve, reject) => {
      this.db.allDocs({
        query: `parentId:"${folder.id}"`,
        select_list: ['id', 'title', 'parentId', 'botContacts', 'icon']
      })
        .then((response) => response.data.rows)
        .then(
          (rows) => {
            const docs: Doc[] = []
            rows.forEach((obj) => {
              docs.push(Doc.deserialize(obj.value, this))
            })
            resolve(docs)
          },
          (err) => reject(err)
        )
    })
  }

  createDoc (key = this.generateKey()) {
    const doc = new Doc(key, 'Untitled Document', 'local', this)
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
