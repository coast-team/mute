import { Injectable } from '@angular/core'
import { symmetricCrypto } from 'crypto-api-wrapper'

@Injectable()
export class SymmetricCryptoService {
  private textDecoder: TextDecoder
  private key: CryptoKey
  constructor() {
    this.textDecoder = new TextDecoder('utf-8')
  }

  async generateKey(): Promise<string> {
    this.key = await symmetricCrypto.generateEncryptionKey()
    const keyData = await symmetricCrypto.exportKey(this.key)
    return btoa(JSON.stringify(keyData))
  }

  async importKey(keyData: string): Promise<void> {
    this.key = await symmetricCrypto.importKey(JSON.parse(atob(keyData)))
  }

  async encrypt(msg: Uint8Array): Promise<Uint8Array> {
    const ciphertext = await symmetricCrypto.encrypt(msg, this.key)
    return ciphertext
  }

  async decrypt(ciphertext: Uint8Array): Promise<Uint8Array> {
    const plaintext = await symmetricCrypto.decrypt(ciphertext, this.key)
    return plaintext
  }
}
