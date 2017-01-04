import { Injectable } from '@angular/core'

declare const jIO: any
declare const RSVP: any

@Injectable()
export class StorageService {

  private instance: any

  constructor() {
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

}
