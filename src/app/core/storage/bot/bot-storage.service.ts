import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { filter } from 'rxjs/operators'

import { environment } from '@environments/environment'
import { Doc } from '../../Doc'
import { EProperties } from '../../settings/EProperties.enum'
import { SettingsService } from '../../settings/settings.service'
import { Storage } from '../Storage'

export interface IMetadata {
  signalingKey: string
  cryptoKey: string
  title: string
  titleModified: number
  created: number
}

export enum BotStorageServiceStatus {
  NOT_AUTHORIZED = 1,
  NOT_RESPONDING = 2,
  UNAVAILABLE = 3
}

@Injectable()
export class BotStorageService extends Storage {
  public displayName: string
  public version: string
  public avatar: string
  public httpURL: string
  public wsURL: string

  private isAnonymousAllowed: boolean

  constructor(
    private http: HttpClient,
    private settings: SettingsService
  ) {
    super()

    if (environment.botStorage) {
      const { httpURL, wsURL, isAnonymousAllowed } = environment.botStorage
      this.httpURL = httpURL
      this.wsURL = wsURL
      this.isAnonymousAllowed = isAnonymousAllowed
    } else {
      this.httpURL = ''
      this.wsURL = ''
      this.isAnonymousAllowed = false
    }
    this.version = ''
    this.avatar = ''
    this.displayName = ''
    if (!this.httpURL) {
      super.setStatus(BotStorageServiceStatus.UNAVAILABLE)
    }

    settings.onChange.pipe(filter((properties) => properties.includes(EProperties.profile))).subscribe(() => this.updateStatus())
  }

  async fetchDocs (): Promise<IMetadata[]> {
    if (this.httpURL && this.status !== BotStorageServiceStatus.NOT_AUTHORIZED) {
      return (await new Promise((resolve) => {
        this.http.get(new URL(`docs/${this.settings.profile.login}`, this.httpURL).toString()).subscribe(
          (metadata: IMetadata[]) => resolve(metadata),
          (err) => {
            log.warn('Could not retrieve documents metadata from the bot storage: ', err.message)
            super.setStatus(BotStorageServiceStatus.NOT_RESPONDING)
            resolve([])
          }
        )
      })) as IMetadata[]
    }
    return []
  }

  async remove (doc: Doc): Promise<void> {
    return await new Promise((resolve) => {
      this.http
        .post<{ key: string; login: string }>(new URL('remove', this.httpURL).toString(), {
          key: doc.signalingKey,
          login: this.settings.profile.login,
        })
        .subscribe(() => resolve())
    })
  }

  get login () {
    return this.httpURL ? `bot.storage@${new URL(this.httpURL).hostname}` : ''
  }

  get id () {
    return `${this.httpURL}`
  }

  private updateStatus (): Promise<void> {
    if (!this.httpURL) {
      return Promise.resolve()
    } 
    
    if (!this.settings.isAuthenticated() && !this.isAnonymousAllowed) {
      super.setStatus(BotStorageServiceStatus.NOT_AUTHORIZED)
      return Promise.resolve()
    } else {
      return new Promise((resolve) => {
        this.http.get(`${this.httpURL}/info`).subscribe(
          (info: { displayName: string; login: string; version: string; avatar: string }) => {
            this.version = info.version
            this.avatar = info.avatar
            this.displayName = info.displayName
            super.setStatus(BotStorageService.AVAILABLE)
            resolve()
          },
          (err) => {
            super.setStatus(BotStorageServiceStatus.NOT_RESPONDING)
            resolve()
          }
        )
      })
    }
    
  }
}
