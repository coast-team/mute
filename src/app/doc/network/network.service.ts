/// <reference path="../../../../node_modules/@types/node/index.d.ts" />
import { Injectable } from '@angular/core'
import { BehaviorSubject, ReplaySubject, Observable, Observer } from 'rxjs/Rx'
import { create } from 'netflux'

import { JoinEvent } from './JoinEvent'
import { fetchIceServers } from './xirsysservers'
import { NetworkMessage } from './NetworkMessage'
import { BotStorageService } from 'core/storage/bot-storage/bot-storage.service'
import { environment } from '../../../environments/environment'
const pb = require('./message_pb.js')

@Injectable()
export class NetworkService {

  private webChannel
  private key: string
  private iceServers: Array<RTCIceServer>

  // Subjects related to the current peer
  private joinObservable: Observable<JoinEvent>
  private joinObservers: Observer<JoinEvent>[] = []
  private leaveSubject: BehaviorSubject<number>
  private doorSubject: BehaviorSubject<boolean>

  // Network message subject
  private messageSubject: ReplaySubject<NetworkMessage>

  /**
   * Peer Join/Leave subjects
   */
  private peerJoinSubject: ReplaySubject<number>
  private peerLeaveSubject: ReplaySubject<number>

  constructor (
    private botStorageService: BotStorageService
  ) {
    log.angular('NetworkService constructed')

    // Initialize subjects
    this.joinObservable = Observable.create((observer) => {
      this.joinObservers.push(observer)
    })
    this.doorSubject = new BehaviorSubject<boolean>(true)
    this.leaveSubject = new BehaviorSubject<number>(-1)

    this.messageSubject = new ReplaySubject<NetworkMessage>()

    this.peerJoinSubject = new ReplaySubject<number>()
    this.peerLeaveSubject = new ReplaySubject<number>()

    this.initWebChannel()

    // Fetch ice servers
    fetchIceServers()
      .then((iceServers) => {
        this.iceServers = iceServers
        if (this.webChannel !== undefined) {
          log.debug('ICE servers: ', iceServers)
          this.webChannel.settings.iceServers = iceServers
        }
      })
      .catch((err) => {
        log.warn('Could not fetch XirSys ice servers', err)
      })

    // Leave webChannel before closing tab or browser
    window.addEventListener('beforeunload', () => {
      if (this.webChannel !== undefined) {
        this.webChannel.leave()
      }
    })
  }

  initWebChannel (): void {
    if (this.webChannel !== undefined) {
      this.webChannel.leave()
    }
    this.webChannel = create({signalingURL: environment.signalingURL})
    if (this.iceServers !== undefined) {
      this.webChannel.settings.iceServers = this.iceServers
    }

    // Peer JOIN event
    this.webChannel.onPeerJoin = (id) => this.peerJoinSubject.next(id)

    // Peer LEAVE event
    this.webChannel.onPeerLeave = (id) => this.peerLeaveSubject.next(id)

    // On door closed
    this.webChannel.onClose = () => this.doorSubject.next(false)

    // Message event
    this.webChannel.onMessage = (id, bytes, isBroadcast) => {
      const msg = pb.Message.deserializeBinary(bytes)
      const networkMessage = new NetworkMessage(msg.getService(), id, isBroadcast, msg.getContent())
      this.messageSubject.next(networkMessage)
    }
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
    return this.joinObservable
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
    this.webChannel.close()
    this.webChannel.leave()
    this.leaveSubject.next(-1)
  }

  join (key): Promise<void> {
    this.key = key
    return this.webChannel.join(key)
      .then(() => {
        log.info('network', `Joined successfully via ${this.webChannel.settings.signalingURL} with ${key} key`)
        this.doorSubject.next(true)
        this.joinObservers.forEach((observer: Observer<JoinEvent>) => {
          observer.next(new JoinEvent(this.webChannel.myId, key, true))
        })
        if (key === this.botStorageService.currentBot.key) {
          this.inviteBot(this.botStorageService.currentBot.url)
        }
      })
      .catch((reason) => {
        log.error(`Could not join via ${this.webChannel.settings.signalingURL} with ${key} key: ${reason}`, this.webChannel)
      })
  }


  inviteBot (url: string): void {
    this.webChannel.invite(`ws://${url}`)
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
