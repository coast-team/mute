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
import { Storage } from '../Storage'

@Injectable()
export class BotStorageService extends Storage {

  public static NOT_AUTHORIZED = 1
  public static NOT_RESPONDING = 2

  public name: string
  public remote: Folder

  private url: string
  private webSocketPath: string
  private secure: boolean

  constructor (
    private http: HttpClient,
    private settings: SettingsService
  ) {
    super()
    const { secure, url, webSocketPath } = environment.botStorage

    if (environment.botStorage && environment.botStorage.url) {
      this.name = ''
      this.secure = environment.botStorage.secure
      this.url = environment.botStorage.url
      this.webSocketPath = environment.botStorage.webSocketPath
      this.remote = new Folder('Remote storage', 'cloud')
      this.remote.id = this.id
    }

    settings.onChange.pipe(
      filter((properties) => properties.includes(EProperties.profile))
    ).subscribe(() => this.updateStatus())
  }

  async fetchDocs (): Promise<string[]> {
    if (this.url) {
      return await new Promise((resolve) => {
        this.http.get(`${this.httpURL}/docs/${this.settings.profile.login}`)
          .subscribe(
          (keys: string[]) => resolve(keys),
          (err) => {
            log.warn('Could not retreive documents keys from the bot storage')
            super.setStatus(BotStorageService.NOT_RESPONDING)
            resolve([])
          }
          )
      }) as string[]
    }
    return []
  }

  get httpURL () {
    const scheme = this.secure ? 'https' : 'http'
    return `${scheme}://${this.url}`
  }

  get wsURL () {
    const scheme = this.secure ? 'wss' : 'ws'
    return `${scheme}://${this.url}/${this.webSocketPath}`
  }

  get id () {
    return `${this.name}@${this.url}`
  }

  private updateStatus (): Promise<void> {
    if (this.url) {
      if (!this.settings.isAuthenticated() && !environment.botStorage.isAnonymousAllowed) {
        super.setStatus(BotStorageService.NOT_AUTHORIZED)
      } else {
        return new Promise((resolve) => {
          this.http.get(`${this.httpURL}/name`, { responseType: 'text' })
            .subscribe(
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

  private getDocByKey (docs, key: string) {

  }
}
