import { Injectable, Renderer2, RendererFactory2 } from '@angular/core'
import { AuthService } from 'ng2-ui-auth'
import { Observable, Subject, Subscription } from 'rxjs'

import { environment } from '../../../environments/environment'
import { CryptoService } from '../crypto/crypto.service'
import { Folder } from '../Folder'
import { EIndexedDBState, getIndexedDBState } from '../storage/local/indexedDBCheck'
import { EProperties } from './EProperties'
import { IAccount } from './IAccount'
import { ISerialize as ISerializeProfile, Profile } from './Profile'

const selectList = ['profile', 'theme', 'displayLogs', 'openedFolder']

const DB_NAME = 'settings_v2'

interface ISerialize {
  profile: ISerializeProfile
  theme: string
  displayLogs: boolean
  openedFolder: string
}

@Injectable()
export class SettingsService {
  public theme: string
  public displayLogs: boolean
  public openedFolder: string
  public changeSubject: Subject<EProperties[]>

  private renderer: Renderer2
  private db: any
  private _profile: Profile
  private profileChangeSub: Subscription
  private isDBAvailable: boolean

  constructor(rendererFactory: RendererFactory2, private auth: AuthService, private crypto: CryptoService) {
    this.renderer = rendererFactory.createRenderer(null, null)
    this.changeSubject = new Subject()
    this.theme = 'default'
    this.displayLogs = false
    this.openedFolder = 'local'
  }

  async init(): Promise<void> {
    this.isDBAvailable = (await getIndexedDBState()) === EIndexedDBState.OK

    if (this.isDBAvailable) {
      // Create profiles database if doesn't exist already
      this.db = jIO.createJIO({
        type: 'query',
        sub_storage: {
          type: 'uuid',
          sub_storage: {
            type: 'indexeddb',
            database: DB_NAME,
          },
        },
      })
    }

    // Get authenticated or anonymous account(s)
    const accounts = this.auth.isAuthenticated() ? [this.auth.getPayload()] : [this.anonymous]
    // Retrieve profile from database
    await this.setProfile(accounts)
  }

  get profile(): Profile {
    return this._profile
  }

  get onChange(): Observable<EProperties[]> {
    return this.changeSubject.asObservable()
  }

  async updateTheme(name: string): Promise<void> {
    if (this.setTheme(name)) {
      this.changeSubject.next([EProperties.theme])
      await this.saveToDB()
    }
  }

  async updateDisplayLogs(display: boolean) {
    if (this.setDisplayLogs(display)) {
      this.changeSubject.next([EProperties.displayLogs])
      await this.saveToDB()
    }
  }

  async updateOpenedFolder(folder: Folder): Promise<void> {
    if (this.setOpenedFolder(folder.id)) {
      this.changeSubject.next([EProperties.openedFolder])
      await this.saveToDB()
    }
  }

  isAuthenticated(): boolean {
    return this.auth.isAuthenticated()
  }

  async signout(): Promise<void> {
    await this.auth.logout().toPromise()
    await this.setProfile([this.anonymous])
  }

  async signin(provider: string): Promise<void> {
    await this.auth.authenticate(provider).toPromise()
    await this.setProfile([this.auth.getPayload()])
  }

  resendNotification() {
    // FIXME: rid of this method
    this.changeSubject.next([EProperties.profile])
  }

  get anonymous(): IAccount {
    return {
      provider: window.location.hostname,
      login: `anonymous`,
      name: 'Anonymous',
      avatar: 'assets/images/icons/account-circle.svg',
    }
  }

  private async setProfile(accounts: IAccount[]): Promise<void> {
    const data = await this.readFromDB(accounts.map((a) => a.login))

    const changedProperties = [EProperties.profile]
    if (this.profileChangeSub) {
      this.profileChangeSub.unsubscribe()
    }
    if (data) {
      this._profile = Profile.deserialize(accounts, data.id, data.value.profile)
      if (this.setTheme(data.value.theme)) {
        changedProperties.push(EProperties.theme)
      }
      if (this.setDisplayLogs(data.value.displayLogs)) {
        changedProperties.push(EProperties.displayLogs)
      }
      if (this.setOpenedFolder(data.value.openedFolder)) {
        changedProperties.push(EProperties.openedFolder)
      }
    } else {
      this._profile = new Profile(accounts)
      await this.saveToDB(true)
    }

    // Generate/Import signing key pair
    if ('coniksClient' in environment && this.isAuthenticated()) {
      if (!this._profile.signingKeyPair) {
        await this.crypto.generateSigningKeyPair()
        this._profile.signingKeyPair = await this.crypto.exportSigningKeyPair()
        this.saveToDB()
      } else {
        await this.crypto.importSigningKeyPair(this._profile.signingKeyPair)
      }
    }

    this.profileChangeSub = this._profile.onChange.subscribe((props) => {
      this.saveToDB()
      this.changeSubject.next(props)
    })
    this.changeSubject.next(changedProperties)
  }

  private setTheme(name: string): boolean {
    if (this.theme !== name) {
      this.renderer.removeClass(window.document.body, 'dark-theme')
      this.renderer.removeClass(window.document.body, 'indigo-theme')
      if (name !== 'default') {
        this.renderer.addClass(window.document.body, `${name}-theme`)
      }
      this.updateThemeProperty(name, 'primary')
      this.updateThemeProperty(name, 'accent')

      // Update background colors
      this.updateThemeProperty(name, 'bg-status-bar')
      this.updateThemeProperty(name, 'bg-app-bar')
      this.updateThemeProperty(name, 'bg-background')
      this.updateThemeProperty(name, 'bg-hover')
      this.updateThemeProperty(name, 'bg-dialog')
      this.updateThemeProperty(name, 'bg-disabled-button')
      this.updateThemeProperty(name, 'bg-raised-button')
      this.updateThemeProperty(name, 'bg-focused-button')
      this.updateThemeProperty(name, 'bg-selected-button')
      this.updateThemeProperty(name, 'bg-selected-disabled-button')
      this.updateThemeProperty(name, 'bg-unselected-chip')
      this.updateThemeProperty(name, 'bg-card')
      this.updateThemeProperty(name, 'bg-disabled-list-option')

      // Update forground colors
      this.updateThemeProperty(name, 'fg-text')
      this.updateThemeProperty(name, 'fg-secondary-text')
      this.updateThemeProperty(name, 'fg-hint-text')
      this.updateThemeProperty(name, 'fg-divider')
      this.updateThemeProperty(name, 'fg-dividers')
      this.updateThemeProperty(name, 'fg-disabled')
      this.updateThemeProperty(name, 'fg-disabled-button')
      this.updateThemeProperty(name, 'fg-icon')
      this.updateThemeProperty(name, 'fg-icons')
      this.updateThemeProperty(name, 'fg-slider-min')
      this.updateThemeProperty(name, 'fg-slider-off')
      this.updateThemeProperty(name, 'fg-fg-slider-off-active')

      // Update theme primary color for html page
      window.document
        .querySelector('meta[name=theme-color]')
        .setAttribute('content', window.getComputedStyle(window.document.documentElement).getPropertyValue(`--${name}-primary`))
      this.theme = name
      return true
    }
    return false
  }

  private setDisplayLogs(value: boolean) {
    if (typeof value === 'boolean') {
      this.displayLogs = value
      return true
    }
    return false
  }

  private setOpenedFolder(id: string) {
    if (id) {
      this.openedFolder = id
      return true
    }
    return false
  }

  private async saveToDB(isNew = false): Promise<void> {
    if (this.isDBAvailable) {
      const data = this.serialize()
      if (isNew) {
        this._profile.dbId = await this.db.post(data)
      } else {
        await this.db.put(this._profile.dbId, data)
      }
    }
  }

  private async readFromDB(lookingLogins: string[]): Promise<{ id: string; value: ISerialize } | undefined> {
    if (this.isDBAvailable) {
      const rows = (await this.db.allDocs({
        query: {
          type: 'simple',
          key: {
            read_from: 'profile',
            equal_match: ({ logins }: { logins: string[] }) => {
              for (const l of lookingLogins) {
                if (logins.includes(l)) {
                  return true
                }
              }
              return false
            },
          },
          value: lookingLogins,
        },
        select_list: selectList,
      })).data.rows
      return rows && rows.length === 1 ? rows[0] : undefined
    }
  }

  private serialize(): ISerialize {
    return {
      profile: this._profile.serialize(),
      theme: this.theme,
      displayLogs: this.displayLogs,
      openedFolder: this.openedFolder,
    }
  }

  private updateThemeProperty(theme, propertyName: string) {
    window.document.documentElement.style.setProperty(
      `--theme-${propertyName}`,
      window.getComputedStyle(window.document.documentElement).getPropertyValue(`--${theme}-${propertyName}`)
    )
  }
}
