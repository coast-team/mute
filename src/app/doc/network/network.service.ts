/// <reference path="../../../../node_modules/@types/node/index.d.ts" />
import { Injectable } from '@angular/core'
import { Observable, ReplaySubject, Subject, Subscription } from 'rxjs/Rx'
import { create } from 'netflux'
import { BroadcastMessage, JoinEvent, NetworkMessage, SendRandomlyMessage, SendToMessage } from 'mute-core'

import { environment } from '../../../environments/environment'
import { XirsysService } from '../../core/xirsys/xirsys.service'
const pb = require('./message_pb.js')

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

  constructor (
    private xirsys: XirsysService
  ) {
    log.angular('NetworkService constructed')

    this.botUrls = []

    // Initialize subjects
    this.disposeSubject = new Subject<void>()

    this.joinSubject = new Subject()
    this.leaveSubject = new Subject()
    this.doorSubject = new Subject()

    this.messageSubject = new ReplaySubject()

    this.peerJoinSubject = new ReplaySubject()
    this.peerLeaveSubject = new ReplaySubject()

    // Leave webChannel before closing tab or browser
    window.addEventListener('beforeunload', () => {
      if (this.webChannel !== undefined) {
        this.webChannel.leave()
      }
    })
  }

  initWebChannel (): void {
    this.webChannel = create({signalingURL: environment.signalingURL})

    // Peer JOIN event
    this.webChannel.onPeerJoin = (id) => this.peerJoinSubject.next(id)

    // Peer LEAVE event
    this.webChannel.onPeerLeave = (id) => this.peerLeaveSubject.next(id)

    // On door closed
    this.webChannel.onClose = () => this.doorSubject.next(false)

    // Message event
    this.webChannel.onMessage = (id, bytes, isBroadcast) => {
      const msg = pb.Message.deserializeBinary(bytes)
      const serviceName = msg.getService()
      if (serviceName === 'botprotocol') {
        let msg = new pb.Message()
        msg.setService('botprotocol')
        let content = new pb.BotProtocol()
        content.setKey(this.key)
        msg.setContent(content.serializeBinary())
        this.webChannel.sendTo(id, msg.serializeBinary())
      } else if (serviceName === 'botresponse') {
        log.debug('BotResponse')
        const url = pb.BotResponse.deserializeBinary(msg.getContent()).getUrl()
        this.botUrls.push(url)
      } else {
        const networkMessage = new NetworkMessage(serviceName, id, isBroadcast, msg.getContent())
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

  cleanWebChannel (): void {
    if (this.webChannel !== undefined) {
      this.webChannel.close()
      this.webChannel.leave()
      this.leaveSubject.next()

      this.disposeSubject.complete()
      this.messageSubject.complete()
      this.joinSubject.complete()
      this.leaveSubject.complete()
      this.peerJoinSubject.complete()
      this.peerLeaveSubject.complete()
      this.doorSubject.complete()

      this.disposeSubject = new Subject<void>()
      this.messageSubject = new ReplaySubject<NetworkMessage>()
      this.joinSubject = new Subject()
      this.leaveSubject = new Subject()
      this.peerJoinSubject = new ReplaySubject<number>()
      this.peerLeaveSubject = new ReplaySubject<number>()
      this.doorSubject = new Subject<boolean>()

      this.messageToBroadcastSubscription.unsubscribe()
      this.messageToSendRandomlySubscription.unsubscribe()
      this.messageToSendToSubscription.unsubscribe()
    }
  }

  join (key): Promise<void> {
    this.key = key
    return this.xirsys.iceServers
      .then((iceServers) => {
        if (iceServers !== null) {
          this.webChannel.settings.iceServers = iceServers
        }
      })
      .catch((err) => log.warn('Xirsys Error', err))
      .then(() => this.webChannel.join(key))
      .then(() => {
        log.info('network', `Joined successfully via ${this.webChannel.settings.signalingURL} with ${key} key`)
        this.doorSubject.next(true)
        const created = this.members.length === 0
        this.joinSubject.next(new JoinEvent(this.webChannel.myId, key, created))
      })
      .catch((reason) => {
        log.error(`Could not join via ${this.webChannel.settings.signalingURL} with ${key} key: ${reason}`, this.webChannel)
        return new Error(`Could not join via ${this.webChannel.settings.signalingURL} with ${key} key: ${reason}`)
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

  send (service: string, content: ArrayBuffer): void

  send (service: string, content: ArrayBuffer, id: number|undefined): void

  send (service: string, content: ArrayBuffer, id?: number|undefined): void {
    const msg = new pb.Message()
    msg.setService(service)
    msg.setContent(content)
    if (id === undefined) {
      this.webChannel.send(msg.serializeBinary())
    } else {
      this.webChannel.sendTo(id, msg.serializeBinary())
    }
  }

  /**
   * Open the door with signaling server if it is closed, otherwise do nothing.
   */
  openDoor (key: string): Promise<void> {
    if (!this.webChannel.isOpen()) {
      return this.webChannel().open(key)
        .then(() => {
          this.doorSubject.next(true)
        })
    }
    return Promise.resolve()
  }

  /**
   * Close the door with signaling server if it is opened, otherwise do nothing.
   */
  closeDoor (): void {
    if (this.webChannel.isOpen()) {
      this.webChannel.close()
      this.doorSubject.next(false)
    }
  }
}
