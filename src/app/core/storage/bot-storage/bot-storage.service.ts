import { Injectable } from '@angular/core'
import { Http } from '@angular/http'
import { ReplaySubject, Observable } from 'rxjs/Rx'

import { AbstractStorageService } from '../AbstractStorageService'
import { File } from '../File'
import { environment } from '../../../../environments/environment'

@Injectable()
export class BotStorageService extends AbstractStorageService {

  private bots: Map<string, {api: string, p2p: string}>

  constructor (private http: Http) {
    super()
    this.bots = new Map()
  }

  getRootFiles (): Promise<File[]> {
    const promises = new Array<Promise<void>>()
    environment.storages.forEach((bot: {api: string, p2p: string}) => {
      promises.push(
        this.http.get(`${bot.api}/name`).toPromise()
          .then((response) => {
            const botName = response.text()
            const botId = 'bs-' + encodeURI(botName.toLowerCase())
            this.bots.set(botId, bot)
            return new File(botId, `Bot Storage: ${botName}`, 'cloud', false, this)
          })
          .catch((err) => {
            log.info(`Bot storage ${bot.api} is unavailable`, err)
            return null
          })
      )
    })
    return Promise.all(promises)
      .then((files) => files.filter((file) => file !== null))
  }

  delete (file: File, name: string): Promise<void> {
    throw new Error('Not implemented')
  }

  deleteAll (file: File): Promise<void> {
    throw new Error('Not implemented')
  }

  getDocuments (file: File): Promise<Array<any>> {
    const bot = this.bots.get(file.id)
    if (bot !== undefined) {
      return this.http.get(`${bot.api}/docs`).toPromise()
        .then((response) => response.json())
    } else {
      log.warn(`Could not find a bot related to ${file.id} file`)
      return Promise.resolve([])
    }
  }

  getDocument (file: File, name: string) {
    throw new Error('Not implemented')
  }

  addDocument (file: File, name: string, doc: any) {
    throw new Error('Not implemented')
  }
}
