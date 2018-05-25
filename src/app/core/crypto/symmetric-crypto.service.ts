import { Injectable } from '@angular/core'
import { symmetricCrypto } from 'crypto-api-wrapper'

@Injectable()
export class SymmetricCryptoService {
  private key: CryptoKey

  async generateKey(): Promise<string> {
    this.key = await symmetricCrypto.generateEncryptionKey()
    return symmetricCrypto.toB64(await symmetricCrypto.exportKey(this.key))
  }

  async importKey(key: string): Promise<void> {
    this.key = await symmetricCrypto.importKey(symmetricCrypto.fromB64(key))
  }

  async encrypt(msg: Uint8Array): Promise<Uint8Array> {
    return symmetricCrypto.encrypt(msg, this.key)
  }

  async decrypt(ciphertext: Uint8Array): Promise<Uint8Array> {
    return symmetricCrypto.decrypt(ciphertext, this.key)
  }
}
