import { Injectable } from '@angular/core'
import { Http } from '@angular/http'

import { environment } from '../../../environments/environment'

@Injectable()
export class BotStorageService {

  public currentBot: {url: string, key: string} = {url: '', key: ''}

  constructor(private http: Http) {}

  reachable (): Promise<void> {
    return this.http.get(`http://${environment.botStorageAPI}/ping`).toPromise()
      .then((response) => {
        if (typeof response.text() !== 'string' || response.text() !== 'pong') {
          let msg = 'Wrong bot storage response on /ping'
          log.error(msg)
          throw new Error(msg)
        }
      })
  }

  getDocuments (): Promise<void> {
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
