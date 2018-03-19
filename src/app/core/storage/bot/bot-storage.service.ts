import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Inject, Injectable } from '@angular/core'
import { AsyncSubject } from 'rxjs/AsyncSubject'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Observable } from 'rxjs/Observable'
import { filter } from 'rxjs/operators'

import { environment } from '../../../../environments/environment'
import { Doc } from '../../Doc'
import { Folder } from '../../Folder'
import { EProperties } from '../../settings/EProperties'
import { SettingsService } from '../../settings/settings.service'
import { IStorage } from '../IStorage'
import { BotStorage } from './BotStorage'

export enum BotStorageStatus {
  AVAILABLE,
  NOT_AUTHORIZED,
  NOT_RESPONDING,
  EXIST,
  NOT_EXIST,
}

@Injectable()
export class BotStorageService implements IStorage {
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
      this.setStatus(BotStorageStatus.EXIST)
    } else {
      this.setStatus(BotStorageStatus.NOT_EXIST)
    }

    settings.onChange.pipe(
      filter((properties) => properties.includes(EProperties.profile))
    ).subscribe(() => {this.updateStatus()})
  }

  get onStatusChange (): Observable<BotStorageStatus | undefined> {
    return this.statusSubject.asObservable()
  }

  getDocs (folder: Folder): Promise<Doc[]> {
    return  Promise.resolve([])
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

  private setStatus (status: BotStorageStatus) {
    if (this.status !== status) {
      this.statusSubject.next(status)
    }
  }

}
