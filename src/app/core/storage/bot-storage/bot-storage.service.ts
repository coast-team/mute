import { Injectable } from '@angular/core'
import { Http } from '@angular/http'
import { ReplaySubject, Observable } from 'rxjs/Rx'

import { AbstractStorageService } from 'core/storage/AbstractStorageService'
import { Folder } from 'core/storage/Folder'
import { environment } from '../../../../environments/environment'

@Injectable()
export class BotStorageService extends AbstractStorageService {

  private bots: Map<string, {api: string, p2p: string}>
  private foldersSubject: ReplaySubject<Folder>

  public onFolders: Observable<Folder>

  constructor (private http: Http) {
    super()
    this.bots = new Map()
    this.foldersSubject = new ReplaySubject()
    this.onFolders = this.foldersSubject.asObservable()
    const promises = new Array<Promise<void>>()
    environment.storages.forEach((bot: {api: string, p2p: string}) => {
      promises.push(
        this.http.get(`${bot.api}/name`).toPromise()
          .then((response) => {
            const botName = response.text()
            const botLink = 'bs-' + encodeURI(botName.toLowerCase())
            this.bots.set(botLink, bot)
            const folder = new Folder(`Bot Storage: ${botName}`, botLink, 'cloud', this)
            this.foldersSubject.next(folder)
          })
          .catch((err) => log.info(`Bot storage ${bot.api} is unavailable`, err))
      )
    })
    Promise.all(promises).then(() => this.foldersSubject.complete())
  }

  delete (folder: Folder, name: string): Promise<void> {
    throw new Error('Not implemented')
  }

  deleteAll (folder: Folder): Promise<void> {
    throw new Error('Not implemented')
  }

  getDocuments (folder: Folder): Promise<Array<any>> {
    const bot = this.bots.get(folder.link)
    if (bot !== undefined) {
      return this.http.get(`${bot.api}/docs`).toPromise()
        .then((response) => response.json())
    } else {
      log.warn(`Could not find a bot related to ${folder.link} folder`)
      return Promise.resolve([])
    }
  }

  getDocument (folder: Folder, name: string) {
    throw new Error('Not implemented')
  }

  addDocument (folder: Folder, name: string, doc: any) {
    throw new Error('Not implemented')
  }
}
