import { Observable, Subject } from 'rxjs'

import { v4 as uuidv4 } from 'uuid'
import { IKeyPair } from '../crypto/crypto.service'
import { EProperties } from './EProperties'
import { IAccount } from './IAccount'

export interface ISerialize {
  displayName: string
  logins: string[]
  signingKeyPair: IKeyPair
}

export class Profile {
  public static anonymous: IAccount = {
    provider: window.location.hostname,
    login: `anonymous`,
    name: 'Anonymous',
    deviceID: '-1',
    avatar: 'assets/images/icons/account-circle.svg',
  }

  public dbId: string
  public activeAccount: IAccount
  public accounts: IAccount[]

  private _displayName: string
  private _signingKeyPair: IKeyPair | undefined
  private _deviceID: string
  private changeSubject: Subject<EProperties[]>

  constructor(accounts: IAccount[]) {
    this._signingKeyPair = undefined
    this._displayName = accounts[0].name
    this._deviceID = accounts[0].deviceID
    this.activeAccount = accounts[0]
    this.accounts = accounts
    this.changeSubject = new Subject()
  }

  static deserialize(accounts: IAccount[], dbId: string, serialized: ISerialize) {
    const profile = new Profile(accounts)
    profile._displayName = serialized.displayName
    let storedDeviceID = window.localStorage.getItem('deviceID')
    if (storedDeviceID === null) {
      storedDeviceID = uuidv4()
      window.localStorage.setItem('deviceID', storedDeviceID)
    }
    profile._deviceID = storedDeviceID
    profile.activeAccount = accounts[0]
    profile.dbId = dbId
    profile._signingKeyPair = serialized.signingKeyPair
    return profile
  }

  get onChange(): Observable<EProperties[]> {
    return this.changeSubject.asObservable()
  }

  get displayName() {
    return this._displayName
  }

  set displayName(value: string) {
    if (value.length === 0) {
      this._displayName = 'Anonymous'
    } else {
      this._displayName = value
    }
    this.changeSubject.next([EProperties.profileDisplayName])
  }

  get signingKeyPair(): IKeyPair {
    return this._signingKeyPair
  }

  set signingKeyPair(keyPair: IKeyPair) {
    this._signingKeyPair = keyPair
    this.changeSubject.next([EProperties.signingKeyPair])
  }

  get name(): string {
    return this.activeAccount.name
  }
  get login(): string {
    if (this.activeAccount.provider === 'github') {
      return this.activeAccount.login + `@github`
    }
    return this.activeAccount.login
  }
  get avatar(): string {
    return this.activeAccount.avatar
  }
  get email(): string {
    return this.activeAccount.email
  }
  get provider(): string {
    return this.activeAccount.provider
  }
  get deviceID(): string {
    return this._deviceID
  }

  serialize(): ISerialize {
    return {
      displayName: this.displayName,
      logins: this.accounts.map((a: IAccount) => a.login),
      signingKeyPair: this._signingKeyPair,
    }
  }
}
