import { Injectable } from '@angular/core'
import { Http } from '@angular/http'

import { environment } from '../../../environments/environment'

@Injectable()
export class BotStorageService {

  private http: Http

  constructor(http: Http) {
    this.http = http
  }

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

  getURL () {
    return environment.botStorage
  }
}
