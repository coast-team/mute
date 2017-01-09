import { Injectable } from '@angular/core'

import { AbstractStorageService } from '../AbstractStorageService'

declare const jIO: any

@Injectable()
export class LocalStorageService extends AbstractStorageService {

  private instance: any
  readonly name: string = 'Local Storage'

  constructor() {
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
    const docs = [
      {
        id: 'id1',
        title: 'title1'
      },
      {
        id: 'id2',
        title: 'title2'
      },
      {
        id: 'id3',
        title: 'title3'
      },
    ]
    return Promise.resolve(docs)
  }

}
