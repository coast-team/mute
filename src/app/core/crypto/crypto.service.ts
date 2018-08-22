import { HttpClient } from '@angular/common/http'
import { Injectable, OnDestroy } from '@angular/core'
import { asymmetricCrypto, KeyAgreementBD, KeyState, MuteCrypto, Symmetric } from '@coast-team/mute-crypto'
import { Observable, Subject, Subscription } from 'rxjs'
import { filter } from 'rxjs/operators'

import { environment } from '../../../environments/environment'
import { EProperties } from '../settings/EProperties'
import { Profile } from '../settings/Profile'
import { SettingsService } from '../settings/settings.service'
import { EncryptionType } from './EncryptionType'
import { PkRequests } from './PkRequests'

export interface IKeyPair {
  publicKey: string
  privateKey: string
}

@Injectable()
export class CryptoService implements OnDestroy {
  public crypto: Symmetric | KeyAgreementBD

  private stateSubject: Subject<KeyState>
  private signingKeyPair: CryptoKeyPair
  private pkRequests: PkRequests
  private login: string

  private subs: Subscription[]

  static async generateKey(): Promise<string> {
    return MuteCrypto.generateKey()
  }

  constructor(http: HttpClient, settings: SettingsService) {
    this.stateSubject = new Subject()
    this.subs = []
    switch (environment.encryption) {
      case EncryptionType.METADATA:
        this.crypto = new Symmetric()
        break
      case EncryptionType.KEY_AGREEMENT_BD:
        this.crypto = new KeyAgreementBD()
        break
      default:
        this.crypto = {
          state: KeyState.UNDEFINED,
          encrypt: () => {
            throw new Error('This method should never be called')
          },
          decrypt: () => {
            throw new Error('This method should never be called')
          },
        } as any
    }
    this.crypto.onStateChange = (state) => this.stateSubject.next(state)

    this.pkRequests = new PkRequests(http)
    this.subs[this.subs.length] = settings.onChange.pipe(filter((props) => props.includes(EProperties.profile))).subscribe(() => {
      this.login = ''
    })
  }

  ngOnDestroy() {
    this.subs.forEach((s) => s.unsubscribe())
  }

  get state(): KeyState {
    return this.crypto.state
  }

  get onStateChange(): Observable<KeyState> {
    return this.stateSubject.asObservable()
  }

  async encrypt(msg: Uint8Array): Promise<Uint8Array> {
    return this.crypto.encrypt(msg)
  }

  async decrypt(ciphertext: Uint8Array): Promise<Uint8Array> {
    return this.crypto.decrypt(ciphertext)
  }

  async checkMySigningKeyPair(profile: Profile) {
    if ('coniksClient' in environment && profile.login !== this.login) {
      if (profile.login === Profile.anonymous.login) {
        throw new Error('You must be authenticated')
      }
      if (profile.signingKeyPair) {
        await this.importSigningKeyPair(profile.signingKeyPair)
      } else {
        await this.generateSigningKeyPair()
        profile.signingKeyPair = await this.exportSigningKeyPair()
      }
      try {
        const pk = await this.pkRequests.lookup(profile.login)
        if (pk !== profile.signingKeyPair.publicKey) {
          throw new Error('Public key in local database and in Coniks server are different')
        }
      } catch (err) {
        await this.pkRequests.register(profile.signingKeyPair.publicKey, profile.login)
      }
      this.login = profile.login
    }
  }

  private async generateSigningKeyPair(): Promise<void> {
    this.signingKeyPair = await asymmetricCrypto.generateSigningKey()
  }

  private async importSigningKeyPair(keyPair: IKeyPair) {
    const publicKey = JSON.parse(keyPair.publicKey)
    const privateKey = JSON.parse(keyPair.privateKey)
    this.signingKeyPair = await asymmetricCrypto.importKey({ publicKey, privateKey })
  }

  private async exportSigningKeyPair(): Promise<IKeyPair> {
    if (this.signingKeyPair === undefined) {
      throw new Error('Signing key pair is not defined')
    }
    const { publicKey, privateKey } = await asymmetricCrypto.exportKey(this.signingKeyPair)
    return {
      publicKey: JSON.stringify(publicKey),
      privateKey: JSON.stringify(privateKey),
    }
  }
}
