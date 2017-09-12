import { Injectable } from '@angular/core'
import { Observable, BehaviorSubject, ReplaySubject, Subject, Subscription } from 'rxjs/Rx'
import { WebGroup, WebGroupState } from 'netflux'
import { BroadcastMessage, JoinEvent, NetworkMessage, SendRandomlyMessage, SendToMessage } from 'mute-core'

import { environment } from '../../../environments/environment'
import { Message, BotResponse, BotProtocol } from './message_pb'

@Injectable()
export class NetworkService {

  public wg: WebGroup
  public key: string
  private botUrls: string[]

  private disposeSubject: Subject<void>

  // Subjects related to the current peer
  private joinSubject: Subject<JoinEvent>
  private leaveSubject: Subject<number>
  private lineSubject: BehaviorSubject<boolean>

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
  private stateSubject: Subject<number>
  private signalingSubject: Subject<number>
  private goneOfflineOnce: boolean

  constructor (
  ) {
    this.botUrls = []
    this.goneOfflineOnce = !navigator.onLine

    // Initialize subjects
    this.peerJoinSubject = new ReplaySubject()
    this.peerLeaveSubject = new ReplaySubject()
    this.signalingSubject = new Subject()
    this.stateSubject = new Subject()
    this.messageSubject = new ReplaySubject()

    this.disposeSubject = new Subject<void>()
    this.lineSubject = new BehaviorSubject(navigator.onLine)
    this.joinSubject = new Subject()
    this.leaveSubject = new Subject()

    this.init()
    // Leave webChannel before closing a tab or the browser
    window.addEventListener('beforeunload', () => {
      if (this.wg !== undefined) {
        this.wg.leave()
      }
    })
    window.addEventListener('online', () => {
      console.log('I am online: ', this.goneOfflineOnce)
      if (this.goneOfflineOnce) {
        this.wg.join(this.key)
        this.lineSubject.next(true)
      }
    })
    window.addEventListener('offline', () => {
      this.goneOfflineOnce = true
      this.wg.leave()
      this.lineSubject.next(false)
    })
  }

  init (): void {
    this.wg = new WebGroup({
      signalingURL: environment.signalingURL,
      iceServers: environment.iceServers
    })
    window.wc = this.wg

    // Handle network events
    this.wg.onMemberJoin = (id) => {
      return this.peerJoinSubject.next(id)
    }
    this.wg.onMemberLeave = (id) => this.peerLeaveSubject.next(id)
    this.wg.onSignalingStateChanged = (state) => this.signalingSubject.next(state)
    this.wg.onStateChanged = (state) => {
      if (state === WebGroupState.JOINED) {
        log.info('network', `Joined successfully via ${this.wg.signalingURL} with ${this.key} key`)
        const joinEvt = new JoinEvent(this.wg.myId, this.key, this.members.length === 0)
        this.joinSubject.next(joinEvt)
      }
      this.stateSubject.next(state)
    }
    this.wg.onMessage = (id, bytes: Uint8Array, isBroadcast) => {
      const msg = Message.decode(bytes)
      const serviceName = msg.service
      if (serviceName === 'botprotocol') {
        const content = BotProtocol.create({key: this.key})
        const msg = Message.create({service: 'botprotocol', content: Message.encode(content).finish()})
        this.wg.sendTo(id, Message.encode(msg).finish())
      } else if (serviceName === 'botresponse') {
        const url = BotResponse.decode(msg.content).url
        this.botUrls.push(url)
      } else {
        const networkMessage = new NetworkMessage(serviceName, id, isBroadcast, msg.content)
        this.messageSubject.next(networkMessage)
      }
    }
  }

  leave () {
    this.wg.leave()
  }

  set initSource (source: Observable<string>) {
    source.takeUntil(this.disposeSubject)
      .subscribe((key: string) => {
        this.key = key
        if (navigator.onLine) {
          this.wg.join(key)
        }
      })
  }

  set messageToBroadcastSource (source: Observable<BroadcastMessage>) {
    this.messageToBroadcastSubscription = source.subscribe((broadcastMessage: BroadcastMessage) => {
      this.send(broadcastMessage.service, broadcastMessage.content)
    })
  }

  set messageToSendRandomlySource (source: Observable<SendRandomlyMessage>) {
    this.messageToSendRandomlySubscription = source.subscribe((sendRandomlyMessage: SendRandomlyMessage) => {
      const index: number = Math.ceil(Math.random() * this.members.length) - 1
      const id: number = this.members[index]
      this.send(sendRandomlyMessage.service, sendRandomlyMessage.content, id)
    })
  }

  set messageToSendToSource (source: Observable<SendToMessage>) {
    this.messageToSendToSubscription = source.subscribe((sendToMessage: SendToMessage) => {
      this.send(sendToMessage.service, sendToMessage.content, sendToMessage.id)
    })
  }

  get myId (): number { return this.wg.myId }

  get members (): number[] { return this.wg.members }

  get onMessage (): Observable<NetworkMessage> { return this.messageSubject.asObservable() }

  get onJoin (): Observable<JoinEvent> { return this.joinSubject.asObservable() }

  get onLine (): Observable<boolean> { return this.lineSubject.asObservable() }

  get onLeave (): Observable<number> { return this.leaveSubject.asObservable() }

  get onPeerJoin (): Observable<number> { return this.peerJoinSubject.asObservable() }

  get onPeerLeave (): Observable<number> { return this.peerLeaveSubject.asObservable() }

  get onStateChange (): Observable<number> { return this.stateSubject.asObservable() }

  get onSignalingStateChange (): Observable<number> { return this.signalingSubject.asObservable() }

  clean (): void {
    if (this.wg !== undefined) {
      this.wg.leave()
      this.leaveSubject.next()

      this.disposeSubject.complete()
      this.messageSubject.complete()
      this.joinSubject.complete()
      this.lineSubject.complete()
      this.leaveSubject.complete()
      this.peerJoinSubject.complete()
      this.peerLeaveSubject.complete()

      this.stateSubject.complete()
      this.signalingSubject.complete()

      this.disposeSubject = new Subject<void>()
      this.messageSubject = new ReplaySubject<NetworkMessage>()
      this.joinSubject = new Subject()
      this.lineSubject = new BehaviorSubject(navigator.onLine)
      this.leaveSubject = new Subject()
      this.peerJoinSubject = new ReplaySubject<number>()
      this.peerLeaveSubject = new ReplaySubject<number>()
      this.stateSubject = new Subject()
      this.signalingSubject = new Subject()

      this.messageToBroadcastSubscription.unsubscribe()
      this.messageToSendRandomlySubscription.unsubscribe()
      this.messageToSendToSubscription.unsubscribe()
    }
  }

  inviteBot (url: string): void {
    if (!this.botUrls.includes(url)) {
      const fullUrl = url.startsWith('ws') ? url : `ws://${url}`
      this.wg.invite(fullUrl)
    }
  }

  send (service: string, content:  Uint8Array, id?: number|undefined): void {
    const msg = Message.create({ service, content})
    if (id === undefined) {
      this.wg.send(Message.encode(msg).finish())
    } else {
      this.wg.sendTo(id, Message.encode(msg).finish())
    }
  }
}
