import { Injectable } from '@angular/core'
import { Http } from '@angular/http'
import { ReplaySubject, Observable } from 'rxjs/Rx'

import { AbstractStorageService } from '../AbstractStorageService'
import { File } from '../../File'
import { Folder } from '../../Folder'
import { Doc } from '../../Doc'
import { environment } from '../../../../environments/environment'
import { BotStorageCotact } from './BotStorageContact'
import { LocalStorageService } from '../local-storage/local-storage.service'

@Injectable()
export class BotStorageService extends AbstractStorageService {

  private bots: Map<string, BotStorageCotact>

  constructor (
    private http: Http,
    private localStorage: LocalStorageService
  ) {
    super()
    this.bots = new Map()
  }

  getRootFolders (): Promise<Folder[]> {
    const promises = new Array<Promise<void>>()
    environment.storages.forEach((bot: BotStorageCotact) => {
      promises.push(
        this.http.get(`${bot.apiURL}/name`).toPromise()
          .then((response) => {
            const botName = response.text()
            const botLinkName = 'bs-' + encodeURI(botName.toLowerCase())
            const folder = new Folder(botLinkName, `Bot Storage: ${botName}`, null, this, 'cloud')
            this.bots.set(folder.id, bot)
            return folder
          })
          .catch((err) => {
            log.warn(`Bot storage ${bot.apiURL} is unavailable`, err)
            return null
          })
      )
    })
    return Promise.all(promises)
      .then((files) => files.filter((file) => file !== null) as any)
  }

  getFiles (folder: Folder): Promise<File[]> {
    const bot = this.bots.get(folder.id)
    if (bot !== undefined) {
      return this.http.get(`${bot.apiURL}/docs`).toPromise()
        .then((response) => response.json())
        .then((keys: Array<Object>) => {
          return keys.map(({id, title}: {id: string, title?: string}) => {
            const doc = new Doc(id, title || 'Untitled Document', folder.id, this.localStorage)
            doc.addBotContact(bot)
            return doc
          })
        })
    } else {
      log.warn(`Could not find a bot related to ${folder.id} file`)
      return Promise.resolve([])
    }
  }
}
