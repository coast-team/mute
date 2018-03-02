import { Inject, Injectable } from '@angular/core'
import { AuthService } from 'ng2-ui-auth'
import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'

import { IAccount } from './IAccount'
import { Profile } from './Profile'

const selectList = [
  'usernames',
  'displayName',
  'settings'
]

@Injectable()
export class ProfileService {

  private db: any
  private profileSubject: Subject<Profile>

  public _profile: Profile

  constructor (
    private auth: AuthService
  ) {
    this.profileSubject = new Subject()
  }

  async init (): Promise<void> {
     // Create profiles database if doesn't exist already
    this.db = jIO.createJIO({
      type: 'query',
      sub_storage: {
        type: 'uuid',
        sub_storage: {
          type: 'indexeddb',
          database: 'profiles'
        }
      }
    })

    // Get authenticated or anonymous account(s)
    const accounts = this.auth.isAuthenticated() ? [this.auth.getPayload()] : [this.anonymous]

    // Retrieve profile from database (with associated accounts and settings)
    return this.setProfile(await this.findProfile(accounts))
  }

  get profile (): Profile { return this._profile }

  get onChange (): Observable<Profile> {
    return this.profileSubject.asObservable()
  }

  async updateProfile (): Promise<void> {
    await this.db.put(this._profile.dbId, this._profile.serialize())
    this.profileSubject.next(this._profile)
    return
  }

  isAuthenticated () {
    return this.auth.isAuthenticated()
  }

  async signout (): Promise<void> {
    await this.auth.logout().toPromise()
    return this.setProfile(await this.findProfile([this.anonymous]))
  }

  async signin (provider: string): Promise<Profile> {
    await this.auth.authenticate(provider).toPromise()
    const profile = await this.findProfile([this.auth.getPayload()])
    this.setProfile(profile)
    return profile
  }

  resendNotification () {
    // FIXME: rid of this method
    this.profileSubject.next(this.profile)
  }

  private async findProfile (accounts: IAccount[]): Promise<Profile> {
    const logins = accounts.map((a) => a.login)
    const rows = (await this.db.allDocs({
      query: {
        type: 'simple',
        key: {
          read_from: 'logins',
          equal_match: (dbLogins: string[]) => {
            for (const l of logins) {
              if (dbLogins.includes(l)) {
                return true
              }
            }
            return false
          }
        },
        value: logins
      },
      select_list: selectList
    })).data.rows

    // Profile found
    if (rows.length !== 0) {
      return Profile.deserialize(accounts, this, rows[0].id, rows[0].value )

    // Profile not found: create a new one
    } else {
      const profile = new Profile (accounts, this)
      profile.dbId = await this.db.post(profile.serialize())
      return profile
    }
  }

  private get anonymous (): IAccount {
    return {
      provider: window.location.hostname,
      login: `anonymous`,
      name: 'Anonymous'
    }
  }

  private setProfile (profile: Profile) {
    this._profile = profile
    this.profileSubject.next(profile)
  }

}
