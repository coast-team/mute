/// <reference path="../../../../node_modules/@types/node/index.d.ts" />
import { Injectable } from '@angular/core'
import { Observable, ReplaySubject, Subject, Subscription } from 'rxjs/Rx'
import { WebChannel } from 'netflux'
import { BroadcastMessage, JoinEvent, NetworkMessage, SendRandomlyMessage, SendToMessage } from 'mute-core'

import { environment } from '../../../environments/environment'
import { Message, BotResponse, BotProtocol } from './message_pb'

@Injectable()
export class NetworkService {

  private webChannel
  private key: string
  private botUrls: string[]

  private disposeSubject: Subject<void>

  // Subjects related to the current peer
  private joinSubject: Subject<JoinEvent>
  private leaveSubject: Subject<number>
  private doorSubject: Subject<boolean>
  private onLineSubject: Subject<boolean>

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

  constructor (
  ) {
    log.angular('NetworkService constructed')

    this.botUrls = []

    // Initialize subjects
    this.disposeSubject = new Subject<void>()

    this.joinSubject = new Subject()
    this.leaveSubject = new Subject()
    this.doorSubject = new Subject()
    this.onLineSubject = new Subject()

    this.stateSubject = new Subject()
    this.signalingSubject = new Subject()

    this.messageSubject = new ReplaySubject()

    this.peerJoinSubject = new ReplaySubject()
    this.peerLeaveSubject = new ReplaySubject()

    // Leave webChannel before closing tab or browser
    window.addEventListener('beforeunload', () => {
      if (this.webChannel !== undefined) {
        this.webChannel.disconnect()
      }
    })
  }

  initWebChannel (): void {
    log.debug('Ice servers: ', environment.iceServers)
    this.webChannel = new WebChannel({signalingURL: environment.signalingURL, iceServers: environment.iceServers})

    // Peer JOIN event
    this.webChannel.onPeerJoin = (id) => this.peerJoinSubject.next(id)

    // Peer LEAVE event
    this.webChannel.onPeerLeave = (id) => this.peerLeaveSubject.next(id)

    // On door closed
    this.webChannel.onClose = () => this.doorSubject.next(false)
    this.webChannel.onSignalingStateChanged = (state) => {
      if (state === this.webChannel.SIGNALING_CLOSED) {
        this.doorSubject.next(false)
      }
    }

    // Message event
    this.webChannel.onMessage = (id, bytes, isBroadcast) => {
      const msg = Message.decode(bytes)
      const serviceName = msg.service
      if (serviceName === 'botprotocol') {
        const content = BotProtocol.create({key: this.key})
        const msg = Message.create({service: 'botprotocol', content: Message.encode(content).finish()})
        this.webChannel.sendTo(id, Message.encode(msg).finish())
      } else if (serviceName === 'botresponse') {
        const url = BotResponse.decode(msg.content).url
        this.botUrls.push(url)
      } else {
        const networkMessage = new NetworkMessage(serviceName, id, isBroadcast, msg.content)
        this.messageSubject.next(networkMessage)
      }
    }
  }

  set initSource (source: Observable<string>) {
    source
      .takeUntil(this.disposeSubject)
      .subscribe((key: string) => {
        this.join(key)
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

  get myId (): number {
    return this.webChannel.myId
  }

  get members (): number[] {
    return this.webChannel.members
  }

  get onMessage (): Observable<NetworkMessage> {
    return this.messageSubject.asObservable()
  }

  get onJoin (): Observable<JoinEvent> {
    return this.joinSubject.asObservable()
  }

  get onLine (): Observable<boolean> {
    return this.onLineSubject.asObservable()
  }

  get onLeave (): Observable<number> {
    return this.leaveSubject.asObservable()
  }

  get onPeerJoin (): Observable<number> {
    return this.peerJoinSubject.asObservable()
  }

  get onPeerLeave (): Observable<number> {
    return this.peerLeaveSubject.asObservable()
  }

  get onDoor (): Observable<boolean> {
    return this.doorSubject.asObservable()
  }

  get onStateChange (): Observable<number> {
    return this.stateSubject.asObservable()
  }


  get onSignalingStateChange (): Observable<number> {
    return this.signalingSubject.asObservable()
  }

  cleanWebChannel (): void {
    if (this.webChannel !== undefined) {
      this.webChannel.disconnect()
      this.leaveSubject.next()

      this.disposeSubject.complete()
      this.messageSubject.complete()
      this.joinSubject.complete()
      this.onLineSubject.complete()
      this.leaveSubject.complete()
      this.peerJoinSubject.complete()
      this.peerLeaveSubject.complete()
      this.doorSubject.complete()

      this.stateSubject.complete()
      this.signalingSubject.complete()

      this.disposeSubject = new Subject<void>()
      this.messageSubject = new ReplaySubject<NetworkMessage>()
      this.joinSubject = new Subject()
      this.onLineSubject = new Subject()
      this.leaveSubject = new Subject()
      this.peerJoinSubject = new ReplaySubject<number>()
      this.peerLeaveSubject = new ReplaySubject<number>()
      this.doorSubject = new Subject<boolean>()
      this.stateSubject = new Subject()
      this.signalingSubject = new Subject()

      this.messageToBroadcastSubscription.unsubscribe()
      this.messageToSendRandomlySubscription.unsubscribe()
      this.messageToSendToSubscription.unsubscribe()
    }
  }

  join (key): Promise<void> {
    this.key = key
    return this.webChannel.join(key)
      .then(() => {
        log.info('network', `Joined successfully via ${this.webChannel.signalingURL} with ${key} key`)
        this.doorSubject.next(true)
        const created = this.members.length === 0
        this.joinSubject.next(new JoinEvent(this.webChannel.myId, key, created))
      })
      .catch((reason) => {
        log.error(`Could not join via ${this.webChannel.signalingURL} with ${key} key: ${reason}`, this.webChannel)
        this.doorSubject.next(false)
        return new Error(`Could not join via ${this.webChannel.signalingURL} with ${key} key: ${reason}`)
      })
  }

  inviteBot (url: string): void {
    if (!this.botUrls.includes(url)) {
      const fullUrl = url.startsWith('ws') ? url : `ws://${url}`
      this.webChannel.invite(fullUrl)
        .then(() => {
          log.info('network', `Bot ${fullUrl} has been invited`)
        })
    }
  }

  fetchServer (): Promise<RTCIceServer[]> {
    return new Promise((resolve, reject) => {
      resolve(environment.iceServers)
    })
  }

  testConnection (): void {
    if (this.webChannel) {
      this.stateSubject.next(this.webChannel.state)
      this.signalingSubject.next(this.webChannel.signalingState)
    }
    this.onLineSubject.next(navigator.onLine)
  }

  launchTest (): void {
    const intervalID = setInterval(() => {
      this.testConnection()
    }, 1000)
  }

  send (service: string, content:  Uint8Array, id?: number|undefined): void {
    const msg = Message.create({ service, content})
    if (id === undefined) {
      this.webChannel.send(Message.encode(msg).finish())
    } else {
      this.webChannel.sendTo(id, Message.encode(msg).finish())
    }
  }

  /**
   * Open the door with signaling server if it is closed, otherwise do nothing.
   */
  openDoor (key: string): Promise<void> {
    // if (!this.webChannel.isOpen()) {
    //   return this.webChannel().open(key)
    //     .then(() => {
    //       this.doorSubject.next(true)
    //     })
    // }
    return Promise.resolve()
  }

  /**
   * Close the door with signaling server if it is opened, otherwise do nothing.
   */
  closeDoor (): void {
    this.webChannel.closeSignaling()
    this.doorSubject.next(false)
  }
}
