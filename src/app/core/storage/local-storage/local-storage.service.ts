import { Injectable } from '@angular/core'
import { ReplaySubject, Observable } from 'rxjs/Rx'

import { AbstractStorageService } from '../AbstractStorageService'
import { File } from '../../File'
import { Folder } from '../../Folder'
import { Doc } from '../../Doc'

@Injectable()
export class LocalStorageService extends AbstractStorageService {

  private homeIO: any
  private trashIO: any
  private jios: Map<File, any>

  public rootFolders: File[]
  public home: Folder
  public trash: Folder

  constructor () {
    super()
    this.home = new Folder('local', 'Local Storage', null, this, 'computer')
    this.trash = new Folder('trash', 'Trash', null, this, 'delete')
    this.rootFolders = [this.home]
    this.homeIO = jIO.createJIO({
      type: 'query',
      sub_storage: {
        type: 'indexeddb',
        database: 'home'
      }
    })
    this.trashIO = jIO.createJIO({
      type: 'query',
      sub_storage: {
        type: 'indexeddb',
        database: 'trash'
      }
    })
    this.jios = new Map()
    this.jios.set(this.home, this.homeIO)
    this.jios.set(this.trash, this.trashIO)
  }

  getRootFolders (): Promise<Folder[]> {
    return Promise.resolve(this.rootFolders)
  }

  get (name: string): Promise<any> {
    const homeIO = this.jios.get(this.rootFolders[0])
    return homeIO.get(name)
  }

  put (name: string, object: any): Promise<string> {
    const homeIO = this.jios.get(this.rootFolders[0])
    return homeIO.put(name, object)
  }

  isReachable (): Promise<boolean> {
    return Promise.resolve(true)
  }

  delete (file: File): Promise<void> {
    const fileIO = this.jios.get(file)
    if (fileIO !== undefined) {
      return new Promise<void>((resolve, reject) => {
        fileIO.remove(file.id)
          .then(() => resolve(), (err: Error) => reject(err)
        )
      })
    }
    return Promise.resolve()
  }

  deleteAll (folder: Folder): Promise<void> {
    const fileIO = this.jios.get(folder)
    if (fileIO !== undefined) {
      folder.getFiles()
        .then((files: File[]) => {
          return files.map((file: File) => file.delete())
        })
        .then((promises) => Promise.all(promises))
    }
    return Promise.resolve()
  }

  getFiles (folder: Folder): Promise<File[]> {
    const fileIO = this.jios.get(folder)
    if (fileIO !== undefined) {
      return fileIO.allDocs()
        .then((response) => response.data.rows)
        .then((docs) => {
          log.debug('Docs: ', docs)
          const files = new Array<File>()
          docs.forEach((doc) => {
            if (doc.id !== null) {
              files.push(new Doc(docs.id, docs.title || 'Untitled Document', folder, this))
            }
          })
          return files
        })
    }
    return Promise.resolve([])
  }

  addFile (folder: Folder, file: File): Promise<void> {
    const fileIO = this.jios.get(file)
    if (fileIO !== undefined) {
      return fileIO.put(file.id, file)
    }
    return Promise.resolve()
  }

}
