import { Injectable } from '@angular/core'
import { AuthService } from 'ng2-ui-auth'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Observable } from 'rxjs/Observable'

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
  private profileSubject: BehaviorSubject<Profile>

  public _profile: Profile

  constructor (
    private auth: AuthService
  ) {
    // Create default profile just for the time to get actual profile (authenticated or anonymous)
    this.profileSubject = new BehaviorSubject(undefined)

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

    // Check whether already authenticated
    let accounts: IAccount[]
    if (this.auth.isAuthenticated()) {
      accounts = [this.auth.getPayload()]
    } else {
      accounts = [this.getAnonymousAccount()]
    }

    // Retreive profile from database (with associated account and settings)
    this.getProfile(accounts).then((profile) => this.setProfile(profile))

  }

  get profile (): Profile { return this._profile }

  get onProfile (): Observable<Profile> {
    return this.profileSubject.asObservable()
  }

  public async updateProfile (): Promise<void> {
    return await this.db.put(this._profile.dbId, this._profile.serialize())
  }

  public isAuthenticated () {
    return this.auth.isAuthenticated()
  }

  public signout (): Promise<void> {
    return this.auth.logout().toPromise()
      .then(() => this.getProfile([this.getAnonymousAccount()]))
      .then((profile: Profile) => this.setProfile(profile))
  }

  public signin (provider: string): Promise<Profile> {
    return this.auth.authenticate(provider).toPromise()
      .then(() => this.getProfile([this.auth.getPayload()]))
      .then((profile: Profile) => {
        this.setProfile(profile)
        return profile
      })
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
      provider: global.window.location.hostname,
      login: `anonymous`,
      name: 'Anonymous'
    }
  }

  private setProfile (profile: Profile) {
    this._profile = profile
    this.profileSubject.next(profile)
  }

}
