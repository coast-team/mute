import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { filter } from 'rxjs/operators'

import { environment } from '../../../../environments/environment'
import { Doc } from '../../Doc'
import { EProperties } from '../../settings/EProperties'
import { SettingsService } from '../../settings/settings.service'
import { Storage } from '../Storage'

export interface IMetadata {
  signalingKey: string
  cryptoKey: string
  title: string
  titleModified: number
  created: number
}

@Injectable()
export class BotStorageService extends Storage {
  public static NOT_AUTHORIZED = 1
  public static NOT_RESPONDING = 2
  public static UNAVAILABLE = 3

  public displayName: string
  public version: string
  public avatar: string
  public httpURL: string
  public wsURL: string

  private isAnonymousAllowed: boolean

  constructor(private http: HttpClient, private settings: SettingsService) {
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
      super.setStatus(BotStorageService.UNAVAILABLE)
    }

    settings.onChange.pipe(filter((properties) => properties.includes(EProperties.profile))).subscribe(() => this.updateStatus())
  }

  async fetchDocs(): Promise<IMetadata[]> {
    if (this.httpURL && this.status !== BotStorageService.NOT_AUTHORIZED) {
      return (await new Promise((resolve) => {
        this.http.get(new URL(`docs/${this.settings.profile.login}`, this.httpURL).toString()).subscribe(
          (metadata) => resolve(metadata),
          (err) => {
            log.warn('Could not retrieve documents metadat from the bot storage: ', err.message)
            super.setStatus(BotStorageService.NOT_RESPONDING)
            resolve([])
          }
        )
      })) as IMetadata[]
    }
    return []
  }

  async remove(doc: Doc): Promise<void> {
    return (await new Promise((resolve) => {
      this.http
        .post<{ key: string; login: string }>(new URL('remove', this.httpURL).toString(), {
          key: doc.signalingKey,
          login: this.settings.profile.login,
        })
        .subscribe(() => resolve())
    })) as Promise<void>
  }

  get login() {
    return this.httpURL ? `bot.storage@${new URL(this.httpURL).hostname}` : ''
  }

  get id() {
    return `${this.httpURL}`
  }

  private updateStatus(): Promise<void> {
    if (this.httpURL) {
      if (!this.settings.isAuthenticated() && !this.isAnonymousAllowed) {
        super.setStatus(BotStorageService.NOT_AUTHORIZED)
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
              super.setStatus(BotStorageService.NOT_RESPONDING)
              resolve()
            }
          )
        })
      }
    }
    return Promise.resolve()
  }
}
