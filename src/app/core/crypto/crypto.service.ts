import { Injectable } from '@angular/core'
import { KeyAgreementBD, KeyState, MuteCrypto, Symmetric } from 'mute-crypto'
import { Observable, Subject } from 'rxjs'

import { environment } from '../../../environments/environment'
import { EncryptionType } from './EncryptionType'

@Injectable()
export class CryptoService {
  public crypto: Symmetric | KeyAgreementBD
  private stateSubject: Subject<KeyState>

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
}
