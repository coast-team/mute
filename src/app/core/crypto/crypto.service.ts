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
  public signingKeyPair: CryptoKeyPair

  private stateSubject: Subject<KeyState>
  private pkRequests: PkRequests
  private login: string
  private members: Map<number, { key?: CryptoKey; buffer: Uint8Array[] }>

  private subs: Subscription[]
  private signatureErrorHandler: (id: number) => void

  static async generateKey(): Promise<string> {
    return MuteCrypto.generateKey()
  }

  constructor(http: HttpClient, settings: SettingsService) {
    this.stateSubject = new Subject()
    this.subs = []
    this.signatureErrorHandler = () => {}
    this.members = new Map()
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
    this.pkRequests = new PkRequests(http)
    this.subs[this.subs.length] = settings.onChange.pipe(filter((props) => props.includes(EProperties.profile))).subscribe(() => {
      this.login = ''
    })
    this.crypto.onStateChange = (state) => this.stateSubject.next(state)
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
        log.debug('Lookup my PK...', { login: profile.login, key: profile.signingKeyPair.publicKey })
        const pk = await this.pkRequests.lookup(profile.login)
        if (pk !== profile.signingKeyPair.publicKey) {
          throw new Error('Public key in local database and in Coniks server are different')
        }
      } catch (err) {
        log.debug('Register my PK...', { login: profile.login, key: profile.signingKeyPair.publicKey })
        await this.pkRequests.register(profile.signingKeyPair.publicKey, profile.login)
      }
      this.login = profile.login
    }
  }

  async verifyLoginPK(id: number, login: string) {
    const publicKey = JSON.parse(await this.pkRequests.lookup(login))
    const cryptoKey = await asymmetricCrypto.importKey(publicKey)
    log.debug('Verified new member signature: ', { id, publicKey })
    const member = this.members.get(id)
    if (member) {
      member.key = cryptoKey
      for (const m of member.buffer) {
        ;(this.crypto as KeyAgreementBD).onMessage(id, m, member.key).catch(() => {
          this.signatureErrorHandler(id)
        })
      }
      member.buffer = []
    } else {
      this.members.set(id, { key: cryptoKey, buffer: [] })
    }
  }

  set onSignatureError(handler: (id: number) => void) {
    this.signatureErrorHandler = handler
  }

  onBDMessage(id: number, content: Uint8Array) {
    if ('coniksClient' in environment) {
      const member = this.members.get(id)
      if (member) {
        if (member.key) {
          ;(this.crypto as KeyAgreementBD).onMessage(id, content, member.key).catch(() => {
            this.signatureErrorHandler(id)
          })
        } else {
          member.buffer.push(content)
        }
      } else {
        this.members.set(id, { buffer: [content] })
      }
    } else {
      ;(this.crypto as KeyAgreementBD).onMessage(id, content)
    }
  }

  private async generateSigningKeyPair(): Promise<void> {
    this.signingKeyPair = await asymmetricCrypto.generateSigningKeyPair()
  }

  private async importSigningKeyPair({ publicKey, privateKey }: IKeyPair) {
    this.signingKeyPair = {
      publicKey: await asymmetricCrypto.importKey(JSON.parse(publicKey)),
      privateKey: await asymmetricCrypto.importKey(JSON.parse(privateKey)),
    }
  }

  private async exportSigningKeyPair(): Promise<IKeyPair> {
    if (this.signingKeyPair === undefined) {
      throw new Error('Signing key pair is not defined')
    }
    return {
      publicKey: JSON.stringify(await asymmetricCrypto.exportKey(this.signingKeyPair.publicKey)),
      privateKey: JSON.stringify(await asymmetricCrypto.exportKey(this.signingKeyPair.privateKey)),
    }
  }
}
