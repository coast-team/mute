import { Injectable } from '@angular/core'
import { Http } from '@angular/http'
import { BehaviorSubject, Observable } from 'rxjs/Rx'

import { StorageServiceInterface } from '../StorageServiceInterface'
import { File } from '../../File'
import { Folder } from '../../Folder'
import { Doc } from '../../Doc'
import { environment } from '../../../../environments/environment'
import { BotInfo } from './BotInfo'
import { FolderBot } from './FolderBot'
import { LocalStorageService } from '../local-storage/local-storage.service'

export type BotTuple = [BotInfo, FolderBot]

@Injectable()
export class BotStorageService implements StorageServiceInterface {
  private botsSubject: BehaviorSubject<BotTuple[]>

  public bots: BotTuple[]

  constructor (
    private http: Http,
    private localStorage: LocalStorageService
  ) {
    this.botsSubject = new BehaviorSubject([])
    this.bots = []

    // Fetch all storage bots
    const promises = new Array<Promise<void>>()
    environment.storages.forEach(({apiURL, p2pURL}) => {
      promises.push(
        this.http.get(`${apiURL}/name`).toPromise()
          .then((response) => {
            const bot = new BotInfo(response.text(), apiURL, p2pURL)
            const folder = new FolderBot(bot, 'cloud', this)
            return [bot, folder]
          })
          .catch((err) => {
            log.warn(`Bot storage ${apiURL} is unavailable`, err)
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
    return this.http.get(`${bot.apiURL}/name`).toPromise()
      .then(() => true)
  }

  fetchFiles (folder: FolderBot): Promise<File[]> {
    return this.http.get(`${folder.bot.apiURL}/docs`)
      .toPromise()
      .then((response) => response.json())
      .then((keys: Array<Object>) => {
        return keys.map(({id, title}: {id: string, title?: string}) => {
          const doc = new Doc(id, title || 'Untitled Document', this.localStorage)
          doc.bot = folder.bot
          doc.botFolder = folder
          return doc
        })
      })
  }

  deleteFiles (folder: Folder): Promise<any> {
    return Promise.reject(new Error('This feature has not been implemented on bot yet'))
  }

}
