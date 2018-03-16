import { Inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core'
import { AuthService } from 'ng2-ui-auth'
import { Observable, Subscribable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'
import { Subscription } from 'rxjs/Subscription'

import { Folder } from '../Folder'
import { StorageService } from '../storage/storage.service'
import { EProperties } from './EProperties'
import { IAccount } from './IAccount'
import { ISerialize as ISerializeProfile, Profile } from './Profile'

const selectList = [
  'profile',
  'theme',
  'openedFolder'
]

interface ISerialize {
  profile: ISerializeProfile,
  theme: string,
  openedFolder: string
}

@Injectable()
export class SettingsService {

  public theme: string
  public openedFolder: Folder
  public changeSubject: Subject<EProperties[]>

  private renderer: Renderer2
  private db: any
  private _profile: Profile
  private profileChangeSub: Subscription

  constructor (
    private rendererFactory: RendererFactory2,
    private auth: AuthService,
    private storage: StorageService,
  ) {
    this.renderer = rendererFactory.createRenderer(null, null)
    this.changeSubject = new Subject()
    this.theme = 'default'
    this.openedFolder = storage.all
  }

  async init (): Promise<void> {
     // Create profiles database if doesn't exist already
    this.db = jIO.createJIO({
      type: 'query',
      sub_storage: {
        type: 'uuid',
        sub_storage: {
          type: 'indexeddb',
          database: 'settings'
        }
      }
    })

    // Get authenticated or anonymous account(s)
    const accounts = this.auth.isAuthenticated() ? [this.auth.getPayload()] : [this.anonymous]
    // Retrieve profile from database
    await this.setProfile(accounts)
  }

  get profile (): Profile { return this._profile }

  get onChange (): Observable<EProperties[]> {
    return this.changeSubject.asObservable()
  }

  async updateTheme (name: string): Promise<void> {
    if (this.setTheme(name)) {
      this.changeSubject.next([EProperties.theme])
      await this.serializeAll()
    }
  }

  async updateOpenedFolder (folder: Folder): Promise<void> {
    if (this.setOpenedFolder(folder)) {
      this.openedFolder = folder
      this.changeSubject.next([EProperties.openedFolder])
      await this.serializeAll()
    }
  }

  isAuthenticated () {
    return this.auth.isAuthenticated()
  }

  async signout (): Promise<void> {
    await this.auth.logout().toPromise()
    await this.setProfile([this.anonymous])
  }

  async signin (provider: string): Promise<void> {
    await this.auth.authenticate(provider).toPromise()
    await this.setProfile([this.auth.getPayload()])
  }

  resendNotification () {
    // FIXME: rid of this method
    this.changeSubject.next([EProperties.profile])
  }

  get anonymous (): IAccount {
    return {
      provider: window.location.hostname,
      login: `anonymous`,
      name: 'Anonymous'
    }
  }

  private async setProfile (accounts: IAccount[]): Promise<void> {
    const lookingLogins = accounts.map((a) => a.login)
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
          }
        },
        value: lookingLogins
      },
      select_list: selectList
    })).data.rows

    const changedProperties = [EProperties.profile]
    if (this.profileChangeSub) {
      this.profileChangeSub.unsubscribe()
    }
    if (rows.length !== 0) {
      this._profile = Profile.deserialize(accounts, rows[0].id, rows[0].value.profile)
      if (this.setTheme(rows[0].value.theme)) {
        changedProperties.push(EProperties.theme)
      }

      const folder = this.storage.findFolder(rows[0].value.openedFolder)
      if (this.setOpenedFolder(folder)) {
        changedProperties.push(EProperties.openedFolder)
      }
    } else {
      this._profile = new Profile(accounts)
      this._profile.dbId = await this.db.post(this.createSerializedData(this._profile))
    }
    this.profileChangeSub = this._profile.onChange.subscribe((props) => {
      this.changeSubject.next(props)
    })
    this.changeSubject.next(changedProperties)
  }

  private setTheme (name: string): boolean {
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
      window.document.querySelector('meta[name=theme-color]').setAttribute(
        'content',
        window.getComputedStyle(window.document.documentElement).getPropertyValue(`--${name}-primary`)
      )
      this.theme = name
      return true
    }
    return false
  }

  private setOpenedFolder (folder: Folder) {
    if (folder && this.openedFolder !== folder) {
      this.openedFolder = folder
      return true
    }
    return false
  }

  private async serializeAll (): Promise<void> {
    await this.db.put(this._profile.dbId, this.createSerializedData(this._profile))
  }

  private createSerializedData (profile: Profile): ISerialize {
    return {
      profile: profile.serialize(),
      theme: this.theme,
      openedFolder: this.openedFolder.key
    }
  }

  private updateThemeProperty (theme, propertyName: string) {
    window.document.documentElement.style.setProperty(
      `--theme-${propertyName}`,
      window.getComputedStyle(window.document.documentElement).getPropertyValue(`--${theme}-${propertyName}`)
    )

  }

}
