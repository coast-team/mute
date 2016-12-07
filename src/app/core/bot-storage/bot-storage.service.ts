import { Injectable } from '@angular/core'
import { Http } from '@angular/http'

@Injectable()
export class BotStorageService {

  private http: Http

  constructor(http: Http) {
    this.http = http
  }

  reachable (ipOrUrl: string): Promise<void> {
    return this.http.get(ipOrUrl + '/ping').toPromise()
      .then((response) => {
        if (typeof response !== 'string' || response !== 'pong') {
          let msg = 'Wrong bot storage response on ping'
          log.error(msg)
          throw new Error(msg)
        }
      })
  }

  getDocuments (ipOrUrl: string): Promise<void> {
    return this.http.get(ipOrUrl + '/docs').toPromise()
      .then((response) => {
        if (typeof response !== 'string') {
          let msg = 'Wrong bot storage response on /docs'
          log.error(msg)
          throw new Error(msg)
        } else {
          return JSON.parse(response)
        }
      })
  }
}
