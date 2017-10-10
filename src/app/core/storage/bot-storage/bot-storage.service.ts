import { Injectable } from '@angular/core'
import { Http } from '@angular/http'
import { BehaviorSubject, Observable } from 'rxjs/Rx'

import { environment } from '../../../../environments/environment'
import { BotInfo } from './BotInfo'

export type BotTuple = [BotInfo]

@Injectable()
export class BotStorageService {
  private botsSubject: BehaviorSubject<BotTuple[]>

  public bots: BotTuple[]

  constructor (
    private http: Http
  ) {
    this.botsSubject = new BehaviorSubject([])
    this.bots = []

    // Fetch all storage bots
    const promises = new Array<Promise<void>>()
    environment.storages.forEach(({secure, host, port}) => {
      const protocol = secure ? 'https' : 'http'
      const hostPort = `${host}:${port}`
      const url = `${protocol}://${hostPort}`
      promises.push(
        this.http.get(`${url}/name`).toPromise()
          .then(() => {
            // const bot = new BotInfo(response.text(), secure, hostPort)
            // const folder = new FolderBot(bot, 'cloud', this)
            // return [bot, folder]
          })
          .catch((err) => {
            log.warn(`Bot storage ${url} is unavailable`, err)
            return undefined
          })
      )
    })
    Promise.all(promises)
      .then((bots: any[]) => {
        return bots.filter((bot) => bot !== undefined)
      })
      .then((bots: BotTuple[]) => {
        this.bots = bots
        this.botsSubject.next(bots)
      })
  }

  get onBots (): Observable<BotTuple[]> {
    return this.botsSubject.asObservable()
  }

  check (bot: BotInfo): Promise<boolean> {
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

  deleteFiles (): Promise<any> {
    return Promise.reject(new Error('This feature has not been implemented on bot yet'))
  }

}
