import { Injectable } from '@angular/core'
import { SymmetricCrypto } from 'mute-crypto'

@Injectable()
export class SymmetricCryptoService {
  private symmetricCrypto: SymmetricCrypto
  constructor() {
    this.symmetricCrypto = new SymmetricCrypto()
  }

  async generateKey(): Promise<string> {
    return this.symmetricCrypto.generateKey()
  }

  async importKey(key: string): Promise<void> {
    return this.symmetricCrypto.importKey(key)
  }

  async encrypt(msg: Uint8Array): Promise<Uint8Array> {
    return this.symmetricCrypto.encrypt(msg)
  }

  async decrypt(ciphertext: Uint8Array): Promise<Uint8Array> {
    return this.symmetricCrypto.decrypt(ciphertext)
  }
}
