import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Inject, Injectable } from '@angular/core'
import { AsyncSubject } from 'rxjs/AsyncSubject'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Observable } from 'rxjs/Observable'

import { environment } from '../../../../environments/environment'
import { BotStorage } from './BotStorage'

@Injectable()
export class BotStorageService {
  private botsSubject: BehaviorSubject<BotStorage[]>

  public bot: BotStorage

  constructor (
    private http: HttpClient
  ) {
    this.botsSubject = new BehaviorSubject([])
  }

  async init () {
    if (environment.storages.length !== 0) {
      const storage = environment.storages[0]
      const url = `${storage.secure ? 'https' : 'http'}://${storage.host}:${storage.port}/name`
      return await this.http.get(url, { responseType: 'text' })
        .subscribe(
          (data: string) => {
            this.bot = new BotStorage('', storage.secure, storage.host, storage.port)
            this.bot.name = data
            this.botsSubject.next([this.bot])
          },
          (err) => {
            log.warn(`Bot storage "${storage.host}" is unavailable: ${err.message}`)
          }
        )
    }
    return Promise.resolve()
  }

  get onBots (): Observable<BotStorage[]> {
    return this.botsSubject.asObservable()
  }

  async whichExist (keys: string[]): Promise<string[]> {
    if (this.bot) {
      return await this.http.post<string[]>(
        `${this.bot.httpURL}/exist`,
        JSON.stringify(keys), {
          headers: new HttpHeaders({'Content-Type': 'application/json'})
        }
      ).toPromise().catch((err) => {
        log.warn(`Failed to check documents existence at Bot Storage "${this.bot.httpURL}"`)
        return []
      })
    }
    return []
  }

}
