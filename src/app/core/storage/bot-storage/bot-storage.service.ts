import { Injectable } from '@angular/core'
import { Http } from '@angular/http'

import { AbstractStorageService } from '../AbstractStorageService'

import { environment } from '../../../../environments/environment'

@Injectable()
export class BotStorageService extends AbstractStorageService {

  public currentBot: {url: string, key: string} = {url: '', key: ''}

  constructor (private http: Http) {
    super('Bot Storage', 'bot', 'cloud')
  }

  isReachable (): Promise<boolean> {
    return this.http.get(`http://${environment.botStorageAPI}/ping`).toPromise()
      .then((response) => {
        if (typeof response.text() !== 'string' || response.text() !== 'pong') {
          let msg = 'Wrong bot storage response on /ping'
          log.error(msg)
          return false
          // FIXME: Re-enable the following line?
          // throw new Error(msg)
        }
        return true
      })
      .catch(() => {
        return false
      })
  }

  delete (name: string): Promise<void> {
    return Promise.reject('not yet implemented')
  }

  deleteAll (): Promise<void> {
    return Promise.reject('not yet implemented')
  }

  getDocuments (): Promise<any> {
    return this.http.get(`http://${environment.botStorageAPI}/docs`).toPromise()
      .then((response) => {
        log.debug('DOCS: ', response.json())
        return response.json()
      })
  }

  updateCurrent (key) {
    this.currentBot.url = this.getURL()
    this.currentBot.key = key
  }

  getURL () {
    return environment.botStorage
  }
}
