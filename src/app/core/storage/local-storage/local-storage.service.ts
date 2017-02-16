import { Injectable } from '@angular/core'
import { ReplaySubject, Observable } from 'rxjs/Rx'

import { AbstractStorageService } from '../AbstractStorageService'
import { Folder } from 'core/storage/Folder'

@Injectable()
export class LocalStorageService extends AbstractStorageService {

  private homeIO: any
  private trashIO: any
  private jios: Map<Folder, any>

  public onFolders: Observable<Folder>

  constructor () {
    super()
    const home = new Folder('Local Storage', 'local', 'computer', this)
    const trash = new Folder('Trash', 'trash', 'delete', this)
    this.onFolders = Observable.of(home, trash)
    this.homeIO = jIO.createJIO({
      type: 'query',
      sub_storage: {
        type: 'uuid',
        sub_storage: {
          type: 'indexeddb',
          database: 'mute'
        }
      }
    })
    this.trashIO = jIO.createJIO({
      type: 'query',
      sub_storage: {
        type: 'uuid',
        sub_storage: {
          type: 'indexeddb',
          database: 'mute'
        }
      }
    })
    this.jios = new Map()
    this.jios.set(home, this.homeIO)
    this.jios.set(trash, this.trashIO)
  }

  delete (folder: Folder, name: string): Promise<void> {
    const folderIO = this.jios.get(folder)
    if (folderIO !== undefined) {
      return new Promise<void>((resolve, reject) => {
        folderIO.remove(name).then(() => resolve(), (err: Error) => reject(err))
      })
    }
    return Promise.resolve()
  }

  deleteAll (folder: Folder): Promise<void> {
    const folderIO = this.jios.get(folder)
    if (folderIO !== undefined) {
      return new Promise<void>((resolve, reject) => {
        this.getDocuments(folder)
          .then((docs: any[]) => {
            const promises: Promise<void>[] = docs.map((doc: any) => {
              return this.delete(folder, doc.id)
            })
            Promise.all(promises)
              .then(() => {
                resolve()
              })
              .catch((err: Error) => {
                reject(err)
              })
          })
      })
    }
    return Promise.resolve()
  }

  get (name: string): Promise<any> {
    const homeIO = this.jios.get(this.home)
    return homeIO.get(name)
  }

  put (name: string, object: any): Promise<string> {
    const homeIO = this.jios.get(this.home)
    return homeIO.put(name, object)
  }

  isReachable (): Promise<boolean> {
    return Promise.resolve(true)
  }

  getDocuments (folder: Folder): Promise<any[]> {
    const folderIO = this.jios.get(folder)
    if (folderIO !== undefined) {
      return folderIO.allDocs().then((response) => {
        return response.data.rows
      })
    }
    return Promise.resolve([])
  }

  getDocument (folder: Folder, name: string) {
    const folderIO = this.jios.get(folder)
    if (folderIO !== undefined) {
      return folderIO.get(name)
    }
    return null
  }

  addDocument (folder: Folder, name: string, doc: any) {
    const folderIO = this.jios.get(folder)
    if (folderIO !== undefined) {
      return folderIO.put(name, doc)
    }
    return true
  }

}
