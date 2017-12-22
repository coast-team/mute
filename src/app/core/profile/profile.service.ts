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

  init (): Promise<void> {
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
    const accounts = this.auth.isAuthenticated() ? [this.auth.getPayload()] : [this.getAnonymousAccount()]

    // Retrieve profile from database (with associated account and settings)
    return this.getProfile(accounts).then((profile) => this.setProfile(profile))
  }

  get profile (): Profile { return this._profile }

  get onChange (): Observable<Profile> {
    return this.profileSubject.asObservable()
  }

  async updateProfile (): Promise<void> {
    return await this.db.put(this._profile.dbId, this._profile.serialize())
  }

  isAuthenticated () {
    return this.auth.isAuthenticated()
  }

  signout (): Promise<void> {
    return this.auth.logout().toPromise()
      .then(() => this.getProfile([this.getAnonymousAccount()]))
      .then((profile: Profile) => this.setProfile(profile))
  }

  signin (provider: string): Promise<Profile> {
    return this.auth.authenticate(provider).toPromise()
      .then(() => this.getProfile([this.auth.getPayload()]))
      .then((profile: Profile) => {
        this.setProfile(profile)
        return profile
      })
  }

  resendNotification () {
    this.profileSubject.next(this.profile)
  }

  private async getProfile (accounts: IAccount[]): Promise<Profile> {
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
      return Profile.deserialize(rows[0].id, rows[0].value, accounts)

    // Profile not found: create a new one
    } else {
      const profile = new Profile (accounts)
      profile.dbId = await this.db.post(profile.serialize())
      return profile
    }
  }

  private getAnonymousAccount () {
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
