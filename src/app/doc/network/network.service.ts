import { Injectable, NgZone } from '@angular/core'
import { BroadcastMessage, JoinEvent, NetworkMessage, SendRandomlyMessage, SendToMessage } from 'mute-core'
import { LogLevel, setLogLevel, SignalingState, WebGroup, WebGroupState } from 'netflux'
import { BehaviorSubject, Observable, ReplaySubject, Subject, Subscription } from 'rxjs'
import { takeUntil } from 'rxjs/operators'

import { environment } from '../../../environments/environment'
import { Message } from './message_proto'

@Injectable()
export class NetworkService {
  public wg: WebGroup
  public key: string
  private botUrls: string[]

  private disposeSubject: Subject<void>

  // Subjects related to the current peer
  private joinSubject: Subject<JoinEvent>
  private leaveSubject: Subject<number>

  // Network message subject
  private messageSubject: ReplaySubject<NetworkMessage>

  /**
   * Peer Join/Leave subjects
   */
  private peerJoinSubject: ReplaySubject<number>
  private peerLeaveSubject: ReplaySubject<number>

  private messageToBroadcastSubscription: Subscription
  private messageToSendRandomlySubscription: Subscription
  private messageToSendToSubscription: Subscription

  // Connection state subject
  private stateSubject: BehaviorSubject<WebGroupState>
  private signalingSubject: BehaviorSubject<SignalingState>

  constructor(private zone: NgZone) {
    this.botUrls = []
    this.key = ''

    // Initialize subjects
    this.peerJoinSubject = new ReplaySubject()
    this.peerLeaveSubject = new ReplaySubject()
    this.signalingSubject = new BehaviorSubject(SignalingState.CLOSED)
    this.stateSubject = new BehaviorSubject(WebGroupState.LEFT)
    this.messageSubject = new ReplaySubject()

    this.disposeSubject = new Subject<void>()
    this.joinSubject = new Subject()
    this.leaveSubject = new Subject()

    // Configure Netflux logs
    if (environment.netfluxLog) {
      setLogLevel(LogLevel.CHANNEL_BUILDER, LogLevel.TOPOLOGY)
    }
  }

  init(): void {
    this.zone.runOutsideAngular(() => {
      this.wg = new WebGroup({
        signalingServer: environment.signalingServer,
        rtcConfiguration: environment.rtcConfiguration,
      })
      window.wg = this.wg

      // Handle network events
      this.wg.onMemberJoin = (id) => this.peerJoinSubject.next(id)
      this.wg.onMemberLeave = (id) => this.peerLeaveSubject.next(id)
      this.wg.onSignalingStateChange = (state) => this.signalingSubject.next(state)
      this.wg.onStateChange = (state: WebGroupState) => {
        if (state === WebGroupState.JOINED) {
          const joinEvt = new JoinEvent(this.wg.myId, this.key, this.members.length === 1)
          this.joinSubject.next(joinEvt)
        }
        this.stateSubject.next(state)
      }
      this.wg.onMessage = (id, bytes: Uint8Array) => {
        const msg = Message.decode(bytes)
        // const serviceName = msg.service
        // if (serviceName === 'botprotocol') {
        //   const content = BotProtocol.create({ key: this.key })
        //   this.wg.sendTo(
        //     id,
        //     Message.encode(
        //       Message.create({
        //         service: 'botprotocol',
        //         content: BotProtocol.encode(content).finish(),
        //       })
        //     ).finish()
        //   )
        // } else if (serviceName === 'botresponse') {
        //   const url = BotResponse.decode(msg.content).url
        //   this.botUrls.push(url)
        // } else {
        // FIXME: As Netflux spec changed and in order to not change mute-core, the isBroadcast parameter
        // (the third parameter in NetworkMessage constructor) is set to true.
        const networkMessage = new NetworkMessage(msg.service, id, true, msg.content)
        this.messageSubject.next(networkMessage)
        // }
      }
    })
  }

  leave() {
    this.wg.leave()
  }

  set initSource(source: Observable<string>) {
    source.pipe(takeUntil(this.disposeSubject)).subscribe((key: string) => {
      this.key = key
      this.join(key)
    })
  }

  set messageToBroadcastSource(source: Observable<BroadcastMessage>) {
    this.messageToBroadcastSubscription = source.subscribe((broadcastMessage: BroadcastMessage) => {
      this.send(broadcastMessage.service, broadcastMessage.content)
    })
  }

  set messageToSendRandomlySource(source: Observable<SendRandomlyMessage>) {
    this.messageToSendRandomlySubscription = source.subscribe((sendRandomlyMessage: SendRandomlyMessage) => {
      const otherMembers: number[] = this.members.filter((i) => i !== this.wg.myId)
      const index: number = Math.ceil(Math.random() * otherMembers.length) - 1
      const id: number = otherMembers[index]
      this.send(sendRandomlyMessage.service, sendRandomlyMessage.content, id)
    })
  }

  set messageToSendToSource(source: Observable<SendToMessage>) {
    this.messageToSendToSubscription = source.subscribe((sendToMessage: SendToMessage) => {
      this.send(sendToMessage.service, sendToMessage.content, sendToMessage.id)
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

  clean(): void {
    if (this.wg !== undefined) {
      this.wg.leave()
      this.leaveSubject.next()

      this.disposeSubject.complete()
      this.messageSubject.complete()
      this.joinSubject.complete()
      this.leaveSubject.complete()
      this.peerJoinSubject.complete()
      this.peerLeaveSubject.complete()

      this.disposeSubject = new Subject<void>()
      this.messageSubject = new ReplaySubject<NetworkMessage>()
      this.joinSubject = new Subject()
      this.leaveSubject = new Subject()
      this.peerJoinSubject = new ReplaySubject<number>()
      this.peerLeaveSubject = new ReplaySubject<number>()

      this.messageToBroadcastSubscription.unsubscribe()
      this.messageToSendRandomlySubscription.unsubscribe()
      this.messageToSendToSubscription.unsubscribe()
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
