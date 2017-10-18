import { IAccount } from './IAccount'
import { Settings } from './Settings'

export class Profile {
  public dbId: string
  public displayName: string
  public activeAccount: IAccount
  public accounts: IAccount[]
  public settings: Settings

  constructor (accounts: IAccount[]) {
    this.displayName = accounts[0].name
    this.activeAccount = accounts[0]
    this.accounts = accounts
    this.settings = new Settings()
  }

  static deserialize (dbId: string, serialized: any, accounts: IAccount[]) {
    const profile = new Profile (accounts)
    profile.dbId = dbId
    profile.displayName = serialized.displayName
    profile.activeAccount = accounts[0]
    profile.settings = Settings.deserialize(serialized)
    return profile
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

  serialize () {
    return {
      displayName: this.displayName,
      logins: this.accounts.map((a: IAccount) => a.login),
      settings: this.settings.serialize()
    }
  }
}
