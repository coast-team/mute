import { Injectable } from '@angular/core'
import { asymmetricCrypto, KeyAgreementBD, KeyState, MuteCrypto, Symmetric } from '@coast-team/mute-crypto'
import { Observable, Subject } from 'rxjs'

import { environment } from '../../../environments/environment'
import { EncryptionType } from './EncryptionType'

export interface IKeyPair {
  publicKey: string
  privateKey: string
}

@Injectable()
export class CryptoService {
  public crypto: Symmetric | KeyAgreementBD
  private stateSubject: Subject<KeyState>
  private signingKeyPair: CryptoKeyPair

  static async generateKey(): Promise<string> {
    return MuteCrypto.generateKey()
  }

  constructor() {
    this.stateSubject = new Subject()
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

  async generateSigningKeyPair(): Promise<void> {
    this.signingKeyPair = await asymmetricCrypto.generateSigningKey()
  }

  async importSigningKeyPair(keyPair: IKeyPair) {
    const publicKey = JSON.parse(keyPair.publicKey)
    const privateKey = JSON.parse(keyPair.privateKey)
    this.signingKeyPair = await asymmetricCrypto.importKey({ publicKey, privateKey })
  }

  async exportSigningKeyPair(): Promise<IKeyPair> {
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
