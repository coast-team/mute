import { Injectable, NgZone, OnDestroy } from '@angular/core'
import { KeyAgreementBD, KeyState, Streams } from '@coast-team/mute-crypto'
import { BroadcastMessage, JoinEvent, NetworkMessage, SendRandomlyMessage, SendToMessage } from 'mute-core'
import { LogLevel, setLogLevel, SignalingState, WebGroup, WebGroupState } from 'netflux'
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs'

import { environment } from '../../../environments/environment'
import { Message } from './message_proto'

@Injectable()
export class NetworkService implements OnDestroy {
  public wg: WebGroup
  public key: string
  private botUrls: string[]

  // Subjects related to the current peer
  private joinSubject: Subject<JoinEvent>
  private leaveSubject: Subject<number>

  // Network message subject
  private messageSubject: Subject<NetworkMessage>

  /**
   * Peer Join/Leave subjects
   */
  private peerJoinSubject: Subject<number>
  private peerLeaveSubject: Subject<number>
  private subs: Subscription[]

  private messageToBroadcastSubscription: Subscription
  private messageToSendRandomlySubscription: Subscription
  private messageToSendToSubscription: Subscription

  // Connection state subject
  private stateSubject: BehaviorSubject<WebGroupState>
  private signalingSubject: BehaviorSubject<SignalingState>

  // Encryption/Decryption
  private bd: KeyAgreementBD | undefined
  private cryptoState: Subject<KeyState>

  constructor(private zone: NgZone) {
    this.botUrls = []
    this.key = ''
    this.subs = []
    this.bd = undefined

    // Initialize subjects
    this.peerJoinSubject = new Subject()
    this.peerLeaveSubject = new Subject()
    this.signalingSubject = new BehaviorSubject(SignalingState.CLOSED)
    this.stateSubject = new BehaviorSubject(WebGroupState.LEFT)
    this.messageSubject = new Subject()
    this.cryptoState = new Subject()

    this.joinSubject = new Subject()
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
  }

  init(): void {
    this.zone.runOutsideAngular(() => {
      this.wg = new WebGroup({
        signalingServer: environment.signalingServer,
        rtcConfiguration: environment.rtcConfiguration,
      })
      window.wg = this.wg

      this.bd = new KeyAgreementBD((msg, streamId) => this.send(streamId, msg))
      this.bd.onStateChange = (state) => this.cryptoState.next(state)

      // Handle network events
      this.wg.onMyId = (myId: number) => this.bd.setMyId(myId)
      this.wg.onMemberJoin = (id) => {
        this.bd.addMember(id)
        this.peerJoinSubject.next(id)
      }
      this.wg.onMemberLeave = (id) => {
        this.bd.removeMember(id)
        this.peerLeaveSubject.next(id)
      }
      this.wg.onSignalingStateChange = (state) => this.signalingSubject.next(state)
      this.wg.onStateChange = (state: WebGroupState) => {
        if (state === WebGroupState.JOINED) {
          this.bd.setReady()
          const joinEvt = new JoinEvent(this.wg.myId, this.key, this.members.length === 1)
          this.joinSubject.next(joinEvt)
        }
        this.stateSubject.next(state)
      }
      this.wg.onMessage = (id, bytes: Uint8Array) => {
        try {
          const { service, content } = Message.decode(bytes)
          if (service === Streams.KEY_AGREEMENT_BD) {
            this.bd.onMessage(id, content)
          } else {
            if (service === 423 && environment.encryption) {
              this.bd
                .decrypt(content)
                .then((decryptedContent) => {
                  this.messageSubject.next(new NetworkMessage(service, id, true, decryptedContent))
                })
                .catch((err) => log.debug('Decryption error: ', err))
              return
            }
            this.messageSubject.next(new NetworkMessage(service, id, true, content))
          }
        } catch (err) {
          log.warn('Message from network decode error: ', err.message)
        }
      }
    })
  }

  leave() {
    this.wg.leave()
  }

  set initSource(source: Observable<string>) {
    this.subs[this.subs.length] = source.subscribe((key: string) => {
      this.key = key
      this.join(key)
    })
  }

  set messageToBroadcastSource(source: Observable<BroadcastMessage>) {
    if (this.messageToBroadcastSubscription) {
      this.messageToBroadcastSubscription.unsubscribe()
    }
    this.messageToBroadcastSubscription = source.subscribe(({ service, content }: BroadcastMessage) => {
      if (service === 423 && environment.encryption && this.bd) {
        this.bd
          .encrypt(content)
          .then((encryptedContent) => this.send(service, encryptedContent))
          .catch((err) => log.debug('Encryption error: ', err))
      } else {
        this.send(service, content)
      }
    })
  }

  set messageToSendRandomlySource(source: Observable<SendRandomlyMessage>) {
    if (this.messageToSendRandomlySubscription) {
      this.messageToSendRandomlySubscription.unsubscribe()
    }
    this.messageToSendRandomlySubscription = source.subscribe(({ service, content }: SendRandomlyMessage) => {
      const otherMembers = this.members.filter((i) => i !== this.wg.myId)
      const index = Math.ceil(Math.random() * otherMembers.length) - 1
      const id = otherMembers[index]

      if (service === 423 && environment.encryption && this.bd) {
        this.bd
          .encrypt(content)
          .then((encryptedContent) => this.send(service, encryptedContent, id))
          .catch((err) => log.debug('Encryption error: ', err))
      } else {
        this.send(service, content, id)
      }
    })
  }

  set messageToSendToSource(source: Observable<SendToMessage>) {
    if (this.messageToSendToSubscription) {
      this.messageToSendToSubscription.unsubscribe()
    }
    this.messageToSendToSubscription = source.subscribe(({ service, content, id }: SendToMessage) => {
      if (service === 423 && environment.encryption && this.bd) {
        this.bd
          .encrypt(content)
          .then((encryptedContent) => this.send(service, encryptedContent, id))
          .catch((err) => log.debug('Encryption error: ', err))
      } else {
        this.send(service, content, id)
      }
    })
  }

  get myId(): number {
    return this.wg.myId
  }

  get members(): number[] {
    return this.wg.members
  }

  get onMessage(): Observable<NetworkMessage> {
    return this.messageSubject.asObservable()
  }

  get onJoin(): Observable<JoinEvent> {
    return this.joinSubject.asObservable()
  }

  get onLeave(): Observable<number> {
    return this.leaveSubject.asObservable()
  }

  get onPeerJoin(): Observable<number> {
    return this.peerJoinSubject.asObservable()
  }

  get onPeerLeave(): Observable<number> {
    return this.peerLeaveSubject.asObservable()
  }

  get onStateChange(): Observable<WebGroupState> {
    return this.stateSubject.asObservable()
  }

  get onSignalingStateChange(): Observable<SignalingState> {
    return this.signalingSubject.asObservable()
  }

  get onCryptoStateChange(): Observable<KeyState> {
    return this.cryptoState.asObservable()
  }

  ngOnDestroy(): void {
    this.messageToBroadcastSubscription.unsubscribe()
    this.messageToSendRandomlySubscription.unsubscribe()
    this.messageToSendToSubscription.unsubscribe()

    if (this.wg !== undefined) {
      this.messageSubject.complete()
      this.joinSubject.complete()
      this.leaveSubject.complete()
      this.peerJoinSubject.complete()
      this.peerLeaveSubject.complete()

      this.wg.leave()
    }
  }

  inviteBot(url: string): void {
    if (!this.botUrls.includes(url)) {
      const fullUrl = url.startsWith('ws') ? url : `ws://${url}`
      this.zone.runOutsideAngular(() => this.wg.invite(fullUrl))
    }
  }

  send(service: number, content: Uint8Array, id?: number | undefined): void {
    const msg = Message.create({ service, content })
    if (id === undefined) {
      this.wg.send(Message.encode(msg).finish())
    } else {
      this.wg.sendTo(id, Message.encode(msg).finish())
    }
  }

  private join(key) {
    console.assert(key !== '')
    this.wg.join(key)
  }
}
