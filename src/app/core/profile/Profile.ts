import { IAccount } from './IAccount'
import { ProfileService } from './profile.service'
import { Settings } from './Settings'

interface ISerialize {
  displayName: string
  logins: string[]
  settings: object
}

export class Profile {
  public dbId: string
  public activeAccount: IAccount
  public accounts: IAccount[]
  public settings: Settings

  private _displayName: string
  private profileService: ProfileService

  constructor (accounts: IAccount[], profileService: ProfileService) {
    this._displayName = accounts[0].name
    this.activeAccount = accounts[0]
    this.accounts = accounts
    this.settings = new Settings()
    this.profileService = profileService
  }

  static deserialize (accounts: IAccount[], profileService: ProfileService, dbId: string, serialized: ISerialize) {
    const profile = new Profile (accounts, profileService)
    profile._displayName = serialized.displayName
    profile.activeAccount = accounts[0]
    profile.settings = Settings.deserialize(serialized)
    profile.dbId = dbId
    return profile
  }

  get displayName () { return this._displayName }

  set displayName (value: string) {
    if (value.length === 0) {
      this._displayName = 'Anonymous'
    } else {
      this._displayName = value
    }
    this.profileService.updateProfile()
  }

  get name (): string { return this.activeAccount.name }
  get login (): string {
    if (this.activeAccount.provider === 'github') {
      return this.activeAccount.login + `@github`
    }
    return this.activeAccount.login
  }
  get avatar (): string { return this.activeAccount.avatar }
  get email (): string { return this.activeAccount.email }
  get provider (): string { return this.activeAccount.provider }

  serialize (): ISerialize {
    return {
      displayName: this.displayName,
      logins: this.accounts.map((a: IAccount) => a.login),
      settings: this.settings.serialize()
    }
  }
}
