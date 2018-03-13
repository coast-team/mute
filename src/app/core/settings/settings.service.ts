import { Inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core'
import { AuthService } from 'ng2-ui-auth'
import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'

import { IAccount } from './IAccount'
import { ISerialize as ISerializeProfile, Profile } from './Profile'

const selectList = [
  'profile',
  'theme'
]

interface ISerialize {
  profile: ISerializeProfile,
  theme: string
}

@Injectable()
export class SettingsService {

  public theme: string

  private renderer: Renderer2
  private db: any
  private profileSubject: Subject<Profile>
  private _profile: Profile

  constructor (
    private rendererFactory: RendererFactory2,
    private auth: AuthService
  ) {
    this.renderer = rendererFactory.createRenderer(null, null)
    this.profileSubject = new Subject()
    this.theme = 'default'
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
    await this.setupProfile(accounts)

    // Setup theme
    if (this.theme !== 'default') {
      this.renderer.addClass(window.document.body, `${this.theme}-theme`)
      this.setupTheme(this.theme)
    }
  }

  get profile (): Profile { return this._profile }

  get onChange (): Observable<Profile> {
    return this.profileSubject.asObservable()
  }

  async updateProfile (): Promise<void> {
    await this.serializeAll()
    this.profileSubject.next(this._profile)
  }

  async updateTheme (name: string): Promise<void> {
    if (this.theme !== name) {
      this.renderer.removeClass(window.document.body, 'dark-theme')
      this.renderer.removeClass(window.document.body, 'indigo-theme')
      if (name !== 'default') {
        this.renderer.addClass(window.document.body, `${name}-theme`)
      }
      this.setupTheme(name)
      this.theme = name
      await this.serializeAll()
    }
  }

  isAuthenticated () {
    return this.auth.isAuthenticated()
  }

  async signout (): Promise<void> {
    await this.auth.logout().toPromise()
    await this.setupProfile([this.anonymous])
  }

  async signin (provider: string): Promise<Profile> {
    await this.auth.authenticate(provider).toPromise()
    await this.setupProfile([this.auth.getPayload()])
    return this._profile
  }

  resendNotification () {
    // FIXME: rid of this method
    this.profileSubject.next(this.profile)
  }

  private async setupProfile (accounts: IAccount[]): Promise<void> {
    const lookingLogins = accounts.map((a) => a.login)
    const rows = (await this.db.allDocs({
      query: {
        type: 'simple',
        key: {
          read_from: 'profile',
          equal_match: ({ logins }: {logins: string[]}) => {
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

    let profile: Profile
    if (rows.length !== 0) {
      log.debug('found: ', rows)
      profile = Profile.deserialize(accounts, this, rows[0].id, rows[0].value.profile)
      this.theme = rows[0].value.theme
    } else {
      profile = new Profile(accounts, this)
      profile.dbId = await this.db.post(this.createSerializedData(profile))
    }
    this.setProfile(profile)
  }

  private setupTheme (theme: string) {
    // Read theme global CSS variables
    log.debug('setup theme: ', theme)
    const primary = window.getComputedStyle(window.document.documentElement).getPropertyValue(`--${theme}-primary`)
    const accent = window.getComputedStyle(window.document.documentElement).getPropertyValue(`--${theme}-accent`)
    const bgCard = window.getComputedStyle(window.document.documentElement).getPropertyValue(`--${theme}-bg-card`)
    const fgText = window.getComputedStyle(window.document.documentElement).getPropertyValue(`--${theme}-fg-text`)
    log.debug('bgColor: ', bgCard)

    // Apply them
    window.document.documentElement.style.setProperty('--theme-primary', primary)
    window.document.documentElement.style.setProperty('--theme-accent', accent)
    window.document.documentElement.style.setProperty('--theme-bg-card', bgCard)
    window.document.documentElement.style.setProperty('--theme-fg-text', fgText)
  }

  private get anonymous (): IAccount {
    return {
      provider: window.location.hostname,
      login: `anonymous`,
      name: 'Anonymous'
    }
  }

  private setProfile (profile: Profile) {
    log.debug('profile: ', profile)
    this._profile = profile
    this.profileSubject.next(profile)
  }

  private async serializeAll (): Promise<void> {
    await this.db.put(this._profile.dbId, this.createSerializedData(this._profile))
  }

  private createSerializedData (profile: Profile): ISerialize {
    return {
      profile: profile.serialize(),
      theme: this.theme
    }
  }

}
