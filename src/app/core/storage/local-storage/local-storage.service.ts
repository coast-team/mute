import { Injectable } from '@angular/core'
import { ReplaySubject, Observable } from 'rxjs/Rx'

import { AbstractStorageService } from '../AbstractStorageService'
import { File } from 'core/storage/File'

@Injectable()
export class LocalStorageService extends AbstractStorageService {

  private homeIO: any
  private trashIO: any
  private jios: Map<File, any>

  public rootFiles: File[]
  public trashFile: File

  constructor () {
    super()
    const home = new File('local', 'Local Storage', 'computer', false, this)
    this.trashFile = new File('trash', 'Trash', 'delete', false, this)
    this.rootFiles = [home]
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
    this.jios.set(this.trashFile, this.trashIO)
  }

  getRootFiles (): Promise<File[]> {
    return Promise.resolve(this.rootFiles)
  }

  delete (file: File, name: string): Promise<void> {
    const fileIO = this.jios.get(file)
    if (fileIO !== undefined) {
      return new Promise<void>((resolve, reject) => {
        fileIO.remove(name).then(() => resolve(), (err: Error) => reject(err))
      })
    }
    return Promise.resolve()
  }

  deleteAll (file: File): Promise<void> {
    const fileIO = this.jios.get(file)
    if (fileIO !== undefined) {
      return new Promise<void>((resolve, reject) => {
        this.getDocuments(file)
          .then((docs: any[]) => {
            const promises: Promise<void>[] = docs.map((doc: any) => {
              return this.delete(file, doc.id)
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
    const homeIO = this.jios.get(this.rootFiles[0])
    return homeIO.get(name)
  }

  put (name: string, object: any): Promise<string> {
    const homeIO = this.jios.get(this.rootFiles[0])
    return homeIO.put(name, object)
  }

  isReachable (): Promise<boolean> {
    return Promise.resolve(true)
  }

  getDocuments (file: File): Promise<any[]> {
    const fileIO = this.jios.get(file)
    if (fileIO !== undefined) {
      return fileIO.allDocs().then((response) => {
        return response.data.rows
      })
    }
    return Promise.resolve([])
  }

  getDocument (file: File, name: string) {
    const fileIO = this.jios.get(file)
    if (fileIO !== undefined) {
      return fileIO.get(name)
    }
    return null
  }

  addDocument (file: File, name: string, doc: any) {
    const fileIO = this.jios.get(file)
    if (fileIO !== undefined) {
      return fileIO.put(name, doc)
    }
    return true
  }

}
