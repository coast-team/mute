import { Injectable, NgZone, OnDestroy } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { StreamId, Streams, Streams as MuteCoreStreams, StreamsSubtype } from '@coast-team/mute-core'
import { KeyAgreementBD, KeyState, Streams as MuteCryptoStreams, Symmetric } from '@coast-team/mute-crypto'
import { SignalingState, WebGroup, WebGroupState } from 'netflux'
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs'

import { keyAgreementCrypto } from '@coast-team/mute-crypto-helper'
import { filter, shareReplay } from 'rxjs/operators'
import { environment } from '../../../environments/environment'
import { CryptoService } from '../../core/crypto/crypto.service'
import { EncryptionType } from '../../core/crypto/EncryptionType'
import { Doc } from '../../core/Doc'
import { Message } from './message_proto'
import { PulsarService } from './pulsar.service'
import { NavComponent } from '/home/ishara/Documents/mutePulsar/src/app/shared/nav/nav.component'

@Injectable()
export class NetworkService implements OnDestroy {
  public wg: WebGroup
  private botUrls: string[]

  // Subjects related to the current peer
  private leaveSubject: Subject<number>

  // Network message subject
  private messageSubject: Subject<{ streamId: StreamId; content: Uint8Array; senderId: number }>

  /**
   * Peer Join/Leave subjects
   */
  private memberJoinSubject: Subject<number>
  private memberLeaveSubject: Subject<number>

  // Connection state subject
  private stateSubject: BehaviorSubject<WebGroupState>
  private signalingSubject: BehaviorSubject<SignalingState>

  // Other
  private subs: Subscription[]
  private _pulsarOn: boolean

  constructor(
    private zone: NgZone,
    private route: ActivatedRoute,
    private cryptoService: CryptoService,
    private pulsarService: PulsarService
  ) {
    this.botUrls = []
    this.subs = []

    // Initialize subjects
    this.memberJoinSubject = new Subject()
    this.memberLeaveSubject = new Subject()
    this.signalingSubject = new BehaviorSubject(SignalingState.CLOSED)
    this.stateSubject = new BehaviorSubject(WebGroupState.LEFT)
    this.messageSubject = new Subject()

    this.leaveSubject = new Subject()

    this.zone.runOutsideAngular(() => {
      this.wg = new WebGroup({
        signalingServer: environment.p2p.signalingServer,
        rtcConfiguration: environment.p2p.rtcConfiguration,
      })
      window.wg = this.wg

      this.wg.onSignalingStateChange = (state) => this.signalingSubject.next(state)

      switch (environment.cryptography.type) {
        case EncryptionType.KEY_AGREEMENT_BD:
          this.configureKeyAgreementBDEncryption()
          break
        case EncryptionType.METADATA:
          this.configureMetaDataEncryption()
          break
        case EncryptionType.NONE:
          this.configureNoEncryption()
          break
        default:
          log.error('Unknown Encryption type: ', environment.cryptography.type)
      }
    })
  }

  leave() {
    this.wg.leave()
  }

  setMessageIn(source: Observable<{ streamId: StreamId; content: Uint8Array; recipientId?: number }>) {
    this.subs[this.subs.length] = source.subscribe(({ streamId, content, recipientId }) => {
      if (streamId.type === MuteCoreStreams.DOCUMENT_CONTENT && environment.cryptography.type !== EncryptionType.NONE) {
        if (!recipientId && this._pulsarOn && streamId.subtype !== StreamsSubtype.METADATA_FIXDATA) {
          console.log('setMessageIn NOW PULSAR', streamId)
          this.pulsarService.sendMessageToPulsar(streamId.type, this.wg.key, content)
        }
        this.cryptoService.crypto
          .encrypt(content)
          .then((encryptedContent) => {
            this.send(streamId, encryptedContent, recipientId)
          })
          .catch((err) => {})
      } else {
        this.send(streamId, content, recipientId)
        if (
          !recipientId &&
          this._pulsarOn &&
          streamId.subtype !== StreamsSubtype.METADATA_FIXDATA &&
          streamId.type !== Streams.COLLABORATORS
        ) {
          console.log('setMessageIn NOW PULSAR', streamId)
          this.pulsarService.sendMessageToPulsar(streamId.type, this.wg.key, content)
        }
      }
    })
  }

  get myId(): number {
    return this.wg.myId
  }

  get members(): number[] {
    return this.wg.members
  }

  get state(): WebGroupState {
    return this.wg.state
  }

  get cryptoState(): KeyState {
    return this.cryptoService.crypto.state
  }

  get messageOut(): Observable<{ streamId: StreamId; content: Uint8Array; senderId: number }> {
    return this.messageSubject.asObservable()
  }

  get onLeave(): Observable<number> {
    return this.leaveSubject.asObservable()
  }

  get onMemberJoin(): Observable<number> {
    return this.memberJoinSubject.asObservable()
  }

  get onMemberLeave(): Observable<number> {
    return this.memberLeaveSubject.asObservable()
  }

  get onStateChange(): Observable<WebGroupState> {
    return this.stateSubject.asObservable()
  }

  get onSignalingStateChange(): Observable<SignalingState> {
    return this.signalingSubject.asObservable()
  }

  get onCryptoStateChange(): Observable<KeyState> {
    return this.cryptoService.onStateChange
  }

  get pulsarOn() {
    return this._pulsarOn
  }

  set pulsarOn(newPulsar: boolean) {
    this._pulsarOn = newPulsar
  }

  ngOnDestroy(): void {
    if (this.wg !== undefined) {
      this.messageSubject.complete()
      this.leaveSubject.complete()
      this.memberJoinSubject.complete()
      this.memberLeaveSubject.complete()
      this.pulsarService.closeSocketConnexion('network service')
      this.wg.leave()
    }
  }

  join(key: string) {
    this.wg.join(key)
    this.route.data.subscribe(({ doc }: { doc: Doc }) => {
      // for the one who create the doc
      console.log('Le doc au sein de network service : ', doc)
      this._pulsarOn = doc.pulsar || this._pulsarOn
      console.log('Le bool au sein de network service :', this._pulsarOn)
      if (this._pulsarOn) {
        this.pulsarConnect(this.wg.id)
        return
      }

      // for the others
      doc.onMetadataChanges
        .pipe(
          filter(({ isLocal, changedProperties }) => {
            return changedProperties.includes(Doc.PULSAR)
          })
        )
        .subscribe(() => {
          if (this._pulsarOn) {
            return // if the change concerns pulsar but is already connected to pulsar
          }
          this._pulsarOn = doc.pulsar
          if (this._pulsarOn) {
            this.pulsarConnect(this.wg.id)
          }
        })
    })
  }

  pulsarConnect(id: number) {
    console.log('PULSSAAAAAAAAAAAAAAAAAAAAR ONNNNNNNNNNNNNNNNNNNNNNNNNNNNn')
    this.pulsarService.sockets = this.wg.key
    this.pulsarService.pulsarMessage$.subscribe((messagePulsar) => {
      try {
        // if (messagePulsar.streamId === MuteCoreStreams.DOCUMENT_CONTENT && environment.cryptography.type !== EncryptionType.NONE) {
        //   this.cryptoService.crypto
        //     .decrypt(messagePulsar.content)
        //     .then((decryptedContent) => {
        //       console.log('DECRYPT PULSAR', decryptedContent)
        // this.messageSubject.next({ streamId: {type : messagePulsar.streamId, subtype : StreamsSubtype.METADATA_PULSAR}, content: decryptedContent, senderId: id })
        //     })
        //     .catch((err) => {
        //       console.log('decrypt err', err)
        //     })
        //   return
        // }
        this.messageSubject.next({
          streamId: { type: messagePulsar.streamId, subtype: StreamsSubtype.METADATA_PULSAR },
          content: messagePulsar.content,
          senderId: id,
        })
      } catch (err) {
        log.warn('Message from network decode error: ', err.message)
      }
    })
  }

  inviteBot(url: string): void {
    if (!this.botUrls.includes(url)) {
      const fullUrl = url.startsWith('ws') ? url : `ws://${url}`
      this.zone.runOutsideAngular(() => this.wg.invite(fullUrl))
    }
  }

  send(streamId: StreamId, content: Uint8Array, id?: number): void {
    if (this.members.length > 1) {
      const msg = Message.create({ type: streamId.type, subtype: streamId.subtype, content })

      if (id === undefined) {
        this.wg.send(Message.encode(msg).finish())
      } else {
        id = id === 0 ? this.randomMember() : id
        this.wg.sendTo(id, Message.encode(msg).finish())
      }
    }
  }

  private randomMember(): number {
    const otherMembers = this.members.filter((i) => i !== this.wg.myId)
    return otherMembers[Math.ceil(Math.random() * otherMembers.length) - 1]
  }

  private configureKeyAgreementBDEncryption() {
    const bd = this.cryptoService.crypto as KeyAgreementBD
    if (environment.cryptography.coniksClient || environment.cryptography.keyserver) {
      bd.signingKey = this.cryptoService.signingKeyPair.privateKey
      this.cryptoService.onSignatureError = (id) => log.error('Signature verification error for ', id)
    }
    bd.onSend = (msg, streamId) => this.send({ type: streamId, subtype: StreamsSubtype.CRYPTO }, msg)
    // Handle network events
    this.wg.onMyId = (myId) => bd.setMyId(myId)
    this.wg.onMemberJoin = (id) => {
      bd.addMember(id)
      this.memberJoinSubject.next(id)
    }
    this.wg.onMemberLeave = (id) => {
      bd.removeMember(id)
      this.memberLeaveSubject.next(id)
    }
    this.wg.onStateChange = (state: WebGroupState) => {
      if (state === WebGroupState.JOINED) {
        bd.setReady()
      }
      this.stateSubject.next(state)
    }
    this.wg.onMessage = (id, bytes: Uint8Array) => {
      try {
        const { type, subtype, content } = Message.decode(bytes)
        if (type === MuteCryptoStreams.KEY_AGREEMENT_BD) {
          this.cryptoService.onBDMessage(id, content)
        } else {
          if (type === MuteCoreStreams.DOCUMENT_CONTENT) {
            this.cryptoService.crypto
              .decrypt(content)
              .then((decryptedContent) => {
                console.log('DECRYPT', decryptedContent)
                this.messageSubject.next({ streamId: { type, subtype }, content: decryptedContent, senderId: id })
              })
              .catch((err) => {})
            return
          }
          this.messageSubject.next({ streamId: { type, subtype }, content, senderId: id })
        }
      } catch (err) {
        log.warn('Message from network decode error: ', err.message)
      }
    }
  }

  private configureMetaDataEncryption() {
    this.route.data.subscribe(({ doc }: { doc: Doc }) => {
      doc.onMetadataChanges
        .pipe(
          filter(({ isLocal, changedProperties }) => {
            return !isLocal && changedProperties.includes(Doc.CRYPTO_KEY)
          })
        )
        .subscribe(() => {
          ;(this.cryptoService.crypto as Symmetric).importKey(doc.cryptoKey)
        })
    })
    // Handle network events
    this.wg.onMemberJoin = (id) => this.memberJoinSubject.next(id)
    this.wg.onMemberLeave = (id) => this.memberLeaveSubject.next(id)
    this.wg.onStateChange = (state: WebGroupState) => this.stateSubject.next(state)

    this.wg.onMessage = (id, bytes: Uint8Array) => {
      try {
        const { type, subtype, content } = Message.decode(bytes)
        if (type === MuteCoreStreams.DOCUMENT_CONTENT) {
          this.cryptoService.crypto
            .decrypt(content)
            .then((decryptedContent) => {
              this.messageSubject.next({ streamId: { type, subtype }, content: decryptedContent, senderId: id })
            })
            .catch((err) => {})
          return
        }
        this.messageSubject.next({ streamId: { type, subtype }, content, senderId: id })
      } catch (err) {
        log.warn('Message from network decode error: ', err.message)
      }
    }
  }

  private configureNoEncryption() {
    // Handle network events
    this.wg.onMemberJoin = (id) => this.memberJoinSubject.next(id)
    this.wg.onMemberLeave = (id) => this.memberLeaveSubject.next(id)
    this.wg.onStateChange = (state: WebGroupState) => this.stateSubject.next(state)

    this.wg.onMessage = (id, bytes: Uint8Array) => {
      try {
        const { type, subtype, content } = Message.decode(bytes)
        console.log('CONTENT', content)
        this.messageSubject.next({ streamId: { type, subtype }, content, senderId: id })
      } catch (err) {
        log.warn('Message from network decode error: ', err.message)
      }
    }
  }
}
