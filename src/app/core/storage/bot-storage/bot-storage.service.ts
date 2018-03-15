import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Inject, Injectable } from '@angular/core'
import { AsyncSubject } from 'rxjs/AsyncSubject'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Observable } from 'rxjs/Observable'

import { environment } from '../../../../environments/environment'
import { Folder } from '../../Folder'
import { SettingsService } from '../../settings/settings.service'
import { BotStorage } from './BotStorage'

export enum BotStorageStatus {
  AVAILABLE,
  NOT_AUTHORIZED,
  NOT_RESPONDING,
  NOT_EXISTED,
}

@Injectable()
export class BotStorageService {
  private statusSubject: BehaviorSubject<BotStorageStatus | undefined>

  public bot: BotStorage
  public remote: Folder
  public status: BotStorageStatus

  constructor (
    private http: HttpClient,
    private settings: SettingsService
  ) {
    this.statusSubject = new BehaviorSubject(undefined)
    this.remote = new Folder('', 'Remote storage', 'cloud')
    if (environment.botStorage && environment.botStorage.host) {
      const { secure, host, port } = environment.botStorage
      this.bot = new BotStorage('', secure, host, port)
      this.remote = new Folder(this.bot.id, 'Remote storage', 'cloud')
    } else {
      this.setStatus(BotStorageStatus.NOT_EXISTED)
    }

    settings.onProfileChange.subscribe(() => this.updateStatus())
  }

  get onStatusChange (): Observable<BotStorageStatus | undefined> {
    return this.statusSubject.asObservable()
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

  private updateStatus (): Promise<void> {
    if (this.bot) {
      if (!this.settings.isAuthenticated() && !environment.botStorage.isAnonymousAllowed) {
        this.setStatus(BotStorageStatus.NOT_AUTHORIZED)
      } else {
        const { secure, host, port } = environment.botStorage
        const url = `${secure ? 'https' : 'http'}://${host}:${port}/name`
        return new Promise((resolve) => {
          this.http.get(url, { responseType: 'text' })
            .subscribe(
              (name: string) => {
                this.bot.name = name
                this.setStatus(BotStorageStatus.AVAILABLE)
                resolve()
              },
              (err) => {
                this.setStatus(BotStorageStatus.NOT_RESPONDING)
                resolve()
              }
            )
        })
      }
    }
    return Promise.resolve()
  }

  private checkName (): Promise<string | undefined> {
    const { secure, host, port } = environment.botStorage
    const url = `${secure ? 'https' : 'http'}://${host}:${port}/name`
    return new Promise((resolve) => {
      this.http.get(url, { responseType: 'text' })
        .subscribe(
          (name: string) => resolve(name),
          (err) => resolve()
        )
    })
  }

  private setStatus (status: BotStorageStatus) {
    if (this.status !== status) {
      this.statusSubject.next(status)
    }
  }

}
