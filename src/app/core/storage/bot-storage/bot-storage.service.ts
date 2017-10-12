import { Injectable } from '@angular/core'
import { Headers, Http } from '@angular/http'
import { BehaviorSubject, Observable } from 'rxjs/Rx'

import { environment } from '../../../../environments/environment'
import { BotStorage } from './BotStorage'

@Injectable()
export class BotStorageService {
  private botsSubject: BehaviorSubject<BotStorage[]>

  public bots: BotStorage[]

  constructor (
    private http: Http
  ) {
    this.botsSubject = new BehaviorSubject([])
    this.bots = []

    // Fetch all storage bots
    const promises = new Array<Promise<void>>()
    environment.storages.forEach(({secure, host, port}) => {
      const bot = new BotStorage('', secure, host, port)
      promises.push(
        this.http.get(`${bot.httpURL}/name`).toPromise()
          .then((response) => {
            bot.name = response.text()
            log.debug('Fetched: ', bot.name)
            return bot
          })
          .catch((err) => {
            log.warn(`Bot storage "${bot.httpURL}" is unavailable: ${err.message}`)
            return undefined
          })
      )
    })
    Promise.all(promises)
      .then((bots: any[]) => {
        return bots.filter((bot) => bot !== undefined)
      })
      .then((bots: BotStorage[]) => {
        this.bots = bots
        log.debug('bots: ', bots)
        this.botsSubject.next(bots)
      })
  }

  get onBots (): Observable<BotStorage[]> {
    return this.botsSubject.asObservable()
  }

  whichExist (keys: string[], bot): Promise<string[]> {
    const existedKeys = []
    return this.http.post(`${bot.httpURL}/exist`, JSON.stringify(keys), {
      headers: new Headers({'Content-Type': 'application/json'})
    }).toPromise()
    .then((response) => response.json())
    .catch((err) => {
      log.warn(`Bot storage "${bot.httpURL}" is unavailable: ${err.message}`)
      return []
    })
  }

  check (bot: BotStorage): Promise<boolean> {
    return this.http.get(`${bot.httpURL}/name`).toPromise()
      .then(() => true)
  }

  // fetchFiles (folder: FolderBot): Promise<File[]> {
  //   return this.http.get(`${folder.bot.httpURL}/docs`)
  //     .toPromise()
  //     .then((response) => response.json())
  //     .then((keys: Array<Object>) => {
  //       return keys.map(({id, title}: {id: string, title?: string}) => {
  //         const doc = new Doc(id, title || 'Untitled Document', this.localStorage)
  //         // doc.bot = folder.bot
  //         // doc.botFolder = folder
  //         return doc
  //       })
  //     })
  // }

}
