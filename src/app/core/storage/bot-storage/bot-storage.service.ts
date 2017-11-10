import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { AsyncSubject } from 'rxjs/AsyncSubject'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Observable } from 'rxjs/Observable'

import { environment } from '../../../../environments/environment'
import { BotStorage } from './BotStorage'

@Injectable()
export class BotStorageService {
  private botsSubject: BehaviorSubject<BotStorage[]>

  public bot: BotStorage
  public isAvailable: AsyncSubject<boolean>

  constructor (
    private http: HttpClient
  ) {
    this.botsSubject = new BehaviorSubject([])
    this.isAvailable = new AsyncSubject()
    if (environment.storages.length !== 0) {
      const storage = environment.storages[0]
      this.bot = new BotStorage('', storage.secure, storage.host, storage.port)
      this.http.get(`${this.bot.httpURL}/name`)
        .subscribe(
          (data: string) => {
            this.bot.name = data
            this.botsSubject.next([this.bot])
            this.isAvailable.next(true)
            this.isAvailable.complete()
          },
          (err) => {
            log.warn(`Bot storage "${this.bot.httpURL}" is unavailable: ${err.message}`)
            this.isAvailable.next(false)
            this.isAvailable.complete()
          }
        )
    }
  }

  get onBots (): Observable<BotStorage[]> {
    return this.botsSubject.asObservable()
  }

  async whichExist (keys: string[]): Promise<string[]> {
    const isAvailable = await this.isAvailable.toPromise()
    if (isAvailable) {
      return await this.http.post<string[]>(
        `${this.bot.httpURL}/exist`,
        JSON.stringify(keys), {
          headers: new HttpHeaders({'Content-Type': 'application/json'})
        }
      ).toPromise()
    } else {
      return []
    }
  }

}
