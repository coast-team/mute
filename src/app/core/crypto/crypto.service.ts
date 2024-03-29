import { HttpClient } from '@angular/common/http'
import { Injectable, OnDestroy } from '@angular/core'
import { Observable, Subject, Subscription } from 'rxjs'
import { filter } from 'rxjs/operators'

import { KeyAgreementBD, KeyState, MuteCrypto, Symmetric } from '@coast-team/mute-crypto'
import { asymmetricCrypto } from '@coast-team/mute-crypto-helper'

import { environment } from '@environments/environment'
import { EProperties } from '@app/core/settings/EProperties.enum'
import { Profile } from '@app/core/settings/Profile'
import { SettingsService } from '@app/core/settings/settings.service'

import { EncryptionType } from './EncryptionType.model'
import { PKRequest } from './PKRequest'
import { PKRequestConiks } from './PKRequestConiks'

import { StreamsSubtype } from '@coast-team/mute-core'
import { ActivatedRoute } from '@angular/router'
import { Doc } from '@app/core/Doc'
import { INetworkSolution } from '@app/doc/network/solutions/network.solution.interface'
import { PeersGroupConnectionStatus } from '@app/doc/network'

export interface IKeyPair {
  publicKey: string
  privateKey: string
}

@Injectable()
export class CryptoService implements OnDestroy {
  public crypto: Symmetric | KeyAgreementBD
  public signingKeyPair: CryptoKeyPair

  private networkSolutionService: INetworkSolution
  private stateSubject: Subject<KeyState>
  private pkRequestConiks: PKRequestConiks
  private pkRequest: PKRequest
  private login: string
  private members: Map<number, { key?: CryptoKey; buffer: Uint8Array[] }>

  private subs: Subscription[]
  private signatureErrorHandler: (id: number) => void

  constructor(http: HttpClient, settings: SettingsService) {
    this.stateSubject = new Subject()
    this.subs = []
    this.signatureErrorHandler = () => {}
    this.members = new Map()
    switch (environment.cryptography.type) {
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
    if (environment.cryptography.coniksClient) {
      this.pkRequestConiks = new PKRequestConiks(http)
    } else if (environment.cryptography.keyserver) {
      this.pkRequest = new PKRequest(http)
    }

    this.subs[this.subs.length] = settings.onChange.pipe(filter((props) => props.includes(EProperties.profile))).subscribe(() => {
      this.login = ''
    })
    this.crypto.onStateChange = (state) => {
      this.stateSubject.next(state)
    }
  }

  static async generateKey(): Promise<string> {
    return MuteCrypto.generateKey()
  }

  get state(): KeyState {
    return this.crypto.state
  }

  get onStateChange(): Observable<KeyState> {
    return this.stateSubject.asObservable()
  }

  set onSignatureError(handler: (id: number) => void) {
    this.signatureErrorHandler = handler
  }

  ngOnDestroy() {
    this.subs.forEach((s) => s.unsubscribe())
  }

  async encrypt(msg: Uint8Array): Promise<Uint8Array> {
    return this.crypto.encrypt(msg)
  }

  async decrypt(ciphertext: Uint8Array): Promise<Uint8Array> {
    return this.crypto.decrypt(ciphertext)
  }

  setNetworkSolutionService(network: INetworkSolution) {
    this.networkSolutionService = network
  }

  /**
   * Function that handle the process related to the current cryptography option chosen in the environment
   * @param route The current route
   */
  handleCryptographyProcess(route: ActivatedRoute) {
    switch (environment.cryptography.type) {
      case EncryptionType.KEY_AGREEMENT_BD:
        const bd = this.crypto as KeyAgreementBD
        this.networkSolutionService.myNetworkId.subscribe((myNetworkId) => {
          bd.setMyId(myNetworkId)
        })
        if (environment.cryptography.coniksClient || environment.cryptography.keyserver) {
          bd.signingKey = this.signingKeyPair.privateKey
          this.onSignatureError = (id) => log.error('Signature verification error for ', id)
        }
        bd.onSend = (msg, streamId) => {
          this.networkSolutionService.send({ type: streamId, subtype: StreamsSubtype.CRYPTO }, msg, this.networkSolutionService.peers)
        }
        this.networkSolutionService.memberJoinSubject.subscribe((networkId) => {
          bd.addMember(networkId)
        })
        this.networkSolutionService.memberLeaveSubject.subscribe((networkId) => {
          bd.removeMember(networkId)
        })
        this.networkSolutionService.peersGroupConnectionStatusSubject.subscribe((state) => {
          if (state === PeersGroupConnectionStatus.JOINED) {
            bd.setReady()
          }
        })
        break
      case EncryptionType.METADATA:
        route.data.subscribe(({ doc }: { doc: Doc }) => {
          doc.onMetadataChanges
            .pipe(filter(({ isLocal, changedProperties }) => !isLocal && changedProperties.includes(Doc.CRYPTO_KEY)))
            .subscribe(() => {
              ;(this.crypto as Symmetric).importKey(doc.cryptoKey)
            })
        })
        break
    }
  }

  async checkMySigningKeyPairConiks(profile: Profile) {
    if (!environment.cryptography?.coniksClient) {
      throw new Error('Coniks client is not set')
    }

    if (environment.cryptography.coniksClient && profile.login !== this.login) {
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
        const pk = await this.pkRequestConiks.lookup(profile.login)
        if (pk !== profile.signingKeyPair.publicKey) {
          throw new Error('Public key in local database and in Coniks server are different')
        }
      } catch (err) {
        await this.pkRequestConiks.register(profile.signingKeyPair.publicKey, profile.login)
      }
      this.login = profile.login
    }
  }

  async checkMySigningKeyPair(profile: Profile) {
    if (!environment.cryptography?.keyserver) {
      throw new Error('Key server is not set')
    }

    if (environment.cryptography.keyserver && profile.login !== this.login) {
      if (profile.login === Profile.anonymous.login) {
        throw new Error('You must be authenticated')
      }
      if (profile.signingKeyPair) {
        await this.importSigningKeyPair(profile.signingKeyPair)
      } else {
        await this.generateSigningKeyPair()
        profile.signingKeyPair = await this.exportSigningKeyPair()
      }
      const pk = await this.pkRequest.lookup(profile.login, profile.deviceID)
      log.info('Signing KeyPair', `Check my PK, ${profile.login}:${profile.deviceID}`, pk)
      if (pk === '') {
        await this.pkRequest.register(profile.login, profile.deviceID, profile.signingKeyPair.publicKey)
      } else if (pk !== profile.signingKeyPair.publicKey) {
        await this.pkRequest.update(profile.login, profile.deviceID, profile.signingKeyPair.publicKey)
      }
      this.login = profile.login
    }
  }

  async verifyLoginPK(id: number, login: string, deviceID: string) {
    const publicKey = JSON.parse(await this.pkRequest.lookup(login, deviceID))
    const cryptoKey = await asymmetricCrypto.importKey(publicKey)
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

  async verifyLoginPKConiks(id: number, login: string) {
    const publicKey = JSON.parse(await this.pkRequestConiks.lookup(login))
    const cryptoKey = await asymmetricCrypto.importKey(publicKey)
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

  onBDMessage(id: number, content: Uint8Array) {
    if (environment.cryptography.coniksClient || environment.cryptography.keyserver) {
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
