import { Injectable, NgZone, OnDestroy } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { Streams as MuteCoreStreams } from '@coast-team/mute-core'
import { enableDebug, KeyAgreementBD, KeyState, Streams as MuteCryptoStreams, Symmetric } from '@coast-team/mute-crypto'
import { LogLevel, setLogLevel, SignalingState, WebGroup, WebGroupState } from 'netflux'
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs'

import { filter } from 'rxjs/operators'
import { environment } from '../../../environments/environment'
import { CryptoService } from '../../core/crypto/crypto.service'
import { EncryptionType } from '../../core/crypto/EncryptionType'
import { Doc } from '../../core/Doc'
import { Message } from './message_proto'

@Injectable()
export class NetworkService implements OnDestroy {
  public wg: WebGroup
  private botUrls: string[]

  // Subjects related to the current peer
  private leaveSubject: Subject<number>

  // Network message subject
  private messageSubject: Subject<{ streamId: number; content: Uint8Array; senderId: number }>

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

  constructor(private zone: NgZone, private route: ActivatedRoute, private cryptoService: CryptoService) {
    this.botUrls = []
    this.subs = []

    // Initialize subjects
    this.memberJoinSubject = new Subject()
    this.memberLeaveSubject = new Subject()
    this.signalingSubject = new BehaviorSubject(SignalingState.CLOSED)
    this.stateSubject = new BehaviorSubject(WebGroupState.LEFT)
    this.messageSubject = new Subject()

    this.leaveSubject = new Subject()

    // Configure Netflux logs
    if (environment.netfluxLog) {
      setLogLevel(
        LogLevel.DEBUG,
        LogLevel.CHANNEL,
        LogLevel.SIGNALING,
        LogLevel.WEB_GROUP,
        LogLevel.WEBRTC,
        LogLevel.CHANNEL_BUILDER,
        LogLevel.TOPOLOGY
      )
    }
    enableDebug(true)
    this.zone.runOutsideAngular(() => {
      this.wg = new WebGroup({
        signalingServer: environment.signalingServer,
        rtcConfiguration: environment.rtcConfiguration,
      })
      window.wg = this.wg

      this.wg.onSignalingStateChange = (state) => this.signalingSubject.next(state)

      switch (environment.encryption) {
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
          log.error('Unknown Encryption type: ', environment.encryption)
      }
    })
  }

  leave() {
    this.wg.leave()
  }

  setMessageIn(source: Observable<{ streamId: number; content: Uint8Array; recipientId?: number }>) {
    this.subs[this.subs.length] = source.subscribe(({ streamId, content, recipientId }) => {
      if (this.members.length > 1) {
        if (streamId === MuteCoreStreams.DOCUMENT_CONTENT && environment.encryption !== EncryptionType.NONE) {
          this.cryptoService.crypto
            .encrypt(content)
            .then((encryptedContent) => this.send(streamId, encryptedContent, recipientId))
            .catch((err) => log.debug('Encryption error: ', err))
        } else {
          this.send(streamId, content, recipientId)
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

  get messageOut(): Observable<{ streamId: number; content: Uint8Array; senderId: number }> {
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

  ngOnDestroy(): void {
    if (this.wg !== undefined) {
      this.messageSubject.complete()
      this.leaveSubject.complete()
      this.memberJoinSubject.complete()
      this.memberLeaveSubject.complete()

      this.wg.leave()
    }
  }

  join(key: string) {
    this.wg.join(key)
  }

  inviteBot(url: string): void {
    if (!this.botUrls.includes(url)) {
      const fullUrl = url.startsWith('ws') ? url : `ws://${url}`
      this.zone.runOutsideAngular(() => this.wg.invite(fullUrl))
    }
  }

  send(streamId: number, content: Uint8Array, id?: number): void {
    const msg = Message.create({ streamId, content })
    if (id === undefined) {
      this.wg.send(Message.encode(msg).finish())
    } else {
      id = id === 0 ? this.randomMember() : id
      this.wg.sendTo(id, Message.encode(msg).finish())
    }
  }

  private randomMember(): number {
    const otherMembers = this.members.filter((i) => i !== this.wg.myId)
    return otherMembers[Math.ceil(Math.random() * otherMembers.length) - 1]
  }

  private configureKeyAgreementBDEncryption() {
    const bd = this.cryptoService.crypto as KeyAgreementBD
    bd.onSend = (msg, streamId) => this.send(streamId, msg)

    // Handle network events
    this.wg.onMyId = (myId: number) => bd.setMyId(myId)
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
        const { streamId, content } = Message.decode(bytes)
        if (streamId === MuteCryptoStreams.KEY_AGREEMENT_BD) {
          bd.onMessage(id, content)
        } else {
          if (streamId === MuteCoreStreams.DOCUMENT_CONTENT) {
            this.cryptoService.crypto
              .decrypt(content)
              .then((decryptedContent) => {
                this.messageSubject.next({ streamId, content: decryptedContent, senderId: id })
              })
              .catch((err) => log.debug('Decryption error: ', err))
            return
          }
          this.messageSubject.next({ streamId, content, senderId: id })
        }
      } catch (err) {
        log.warn('Message from network decode error: ', err.message)
      }
    }
  }

  private configureMetaDataEncryption() {
    this.route.data.subscribe(({ doc }: { doc: Doc }) => {
      doc.onMetadataChanges
        .pipe(filter(({ isLocal, changedProperties }) => !isLocal && changedProperties.includes(Doc.CRYPTO_KEY)))
        .subscribe(() => (this.cryptoService.crypto as Symmetric).importKey(doc.cryptoKey).then(() => log.debug('Key is Imported')))
    })
    // Handle network events
    this.wg.onMemberJoin = (id) => this.memberJoinSubject.next(id)
    this.wg.onMemberLeave = (id) => this.memberLeaveSubject.next(id)
    this.wg.onStateChange = (state: WebGroupState) => this.stateSubject.next(state)

    this.wg.onMessage = (id, bytes: Uint8Array) => {
      try {
        const { streamId, content } = Message.decode(bytes)
        if (streamId === MuteCoreStreams.DOCUMENT_CONTENT) {
          this.cryptoService.crypto
            .decrypt(content)
            .then((decryptedContent) => {
              this.messageSubject.next({ streamId, content: decryptedContent, senderId: id })
            })
            .catch((err) => log.debug('Decryption error: ', err))
          return
        }
        this.messageSubject.next({ streamId, content, senderId: id })
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
        const { streamId, content } = Message.decode(bytes)
        this.messageSubject.next({ streamId, content, senderId: id })
      } catch (err) {
        log.warn('Message from network decode error: ', err.message)
      }
    }
  }
}
