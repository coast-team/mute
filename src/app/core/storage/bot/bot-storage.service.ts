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

  public name: string

  private url: string
  private isAnonymousAllowed: boolean

  constructor(private http: HttpClient, private settings: SettingsService) {
    super()
    const { url, isAnonymousAllowed } = environment.botStorage || undefined
    this.url = url || ''
    this.isAnonymousAllowed = isAnonymousAllowed || false
    this.name = ''
    if (!this.url) {
      super.setStatus(BotStorageService.UNAVAILABLE)
    }

    settings.onChange.pipe(filter((properties) => properties.includes(EProperties.profile))).subscribe(() => this.updateStatus())
  }

  async fetchDocs(): Promise<IMetadata[]> {
    if (this.url && this.status !== BotStorageService.NOT_AUTHORIZED) {
      return (await new Promise((resolve) => {
        this.http.get(new URL(`docs/${this.settings.profile.login}`, this.httpURL).toString()).subscribe(
          (docs) => {
            resolve(docs)
          },
          (err) => {
            log.warn('Could not retreive documents keys from the bot storage')
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
    return this.url ? new URL(this.url).hostname : ''
  }

  get httpURL() {
    return this.url
  }

  get wsURL(): string {
    if (this.url) {
      const { protocol, host, pathname } = new URL(this.url)
      let wsURL = protocol === 'http:' ? 'ws://' : 'wss://'
      wsURL += host + pathname
      return wsURL
    }
    return ''
  }

  get id() {
    return `${this.url}`
  }

  private updateStatus(): Promise<void> {
    if (this.url) {
      if (!this.settings.isAuthenticated() && !this.isAnonymousAllowed) {
        super.setStatus(BotStorageService.NOT_AUTHORIZED)
      } else {
        return new Promise((resolve) => {
          this.http.get(`${this.httpURL}/name`, { responseType: 'text' }).subscribe(
            (name: string) => {
              this.name = name
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
