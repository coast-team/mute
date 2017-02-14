import { Injectable } from '@angular/core'

import { AbstractStorageService } from '../AbstractStorageService'

declare const jIO: any

@Injectable()
export class LocalStorageService extends AbstractStorageService {

  private instance: any
  readonly name = 'Local Storage'

  constructor () {
    super()
    this.instance = jIO.createJIO({
      type: 'query',
      sub_storage: {
        type: 'uuid',
        sub_storage: {
          type: 'indexeddb',
          database: 'mute'
        }
      }
    })
  }

  delete (name: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.instance.remove(name)
        .then(() => {
          resolve()
        }, (err: Error) => {
          reject(err)
        })
    })
  }

  deleteAll (): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.getDocuments()
        .then((docs: any[]) => {
          const promises: Promise<void>[] = docs.map((doc: any) => {
            return this.delete(doc.id)
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

  get (name: string): Promise<any> {
    return this.instance.get(name)
  }

  put (name: string, object: any): Promise<string> {
    return this.instance.put(name, object)
  }

  isReachable (): Promise<boolean> {
    return Promise.resolve(true)
  }

  getDocuments (): Promise<any[]> {
    return this.instance.allDocs().then((response) => {
      return response.data.rows
    })
  }

}
