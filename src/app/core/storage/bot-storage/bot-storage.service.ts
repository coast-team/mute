import { Injectable } from '@angular/core'
import { Headers, Http } from '@angular/http'
import { AsyncSubject, BehaviorSubject, Observable } from 'rxjs/Rx'

import { environment } from '../../../../environments/environment'
import { BotStorage } from './BotStorage'

@Injectable()
export class BotStorageService {
  private botsSubject: BehaviorSubject<BotStorage[]>

  public bot: BotStorage
  public isAvailable: AsyncSubject<boolean>

  constructor (
    private http: Http
  ) {
    this.botsSubject = new BehaviorSubject([])
    this.isAvailable = new AsyncSubject()
    const storage = environment.storages[0]
    this.bot = new BotStorage('', storage.secure, storage.host, storage.port)
    this.http.get(`${this.bot.httpURL}/name`).toPromise()
      .then((response) => {
        this.bot.name = response.text()
        this.botsSubject.next([this.bot])
        this.isAvailable.next(true)
        this.isAvailable.complete()
      })
      .catch((err) => {
        log.warn(`Bot storage "${this.bot.httpURL}" is unavailable: ${err.message}`)
        this.isAvailable.next(false)
        this.isAvailable.complete()
      })
  }

  get onBots (): Observable<BotStorage[]> {
    return this.botsSubject.asObservable()
  }

  whichExist (keys: string[]): Promise<string[]> {
    return new Promise ((resolve, reject) => {
      log.debug('whichExist call, ', keys)
      this.isAvailable.subscribe((isAvailable) => {
        log.debug('whichExist is avaialbel: ', isAvailable)
        if (isAvailable) {
          this.http.post(
            `${this.bot.httpURL}/exist`,
            JSON.stringify(keys), {
              headers: new Headers({'Content-Type': 'application/json'})
            }
          ).toPromise()
            .then((response) => {
              log.debug('keys: ', response.json())
              resolve(response.json())
            })
            .catch((err) => reject(err))
        } else {
          resolve([])
        }
      })
    })
  }

}
