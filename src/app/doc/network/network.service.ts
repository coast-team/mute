/// <reference path="../../../../node_modules/@types/node/index.d.ts" />
import { Injectable } from '@angular/core'
import { BehaviorSubject, ReplaySubject, Observable, Observer } from 'rxjs/Rx'
import * as netflux from 'netflux'

import { JoinEvent } from './JoinEvent'
import { NetworkMessage } from './NetworkMessage'
import { BotStorageService } from 'core/bot-storage/bot-storage.service'
import { environment } from '../../../environments/environment'
const pb = require('./message_pb.js')


@Injectable()
export class NetworkService {

  private botStorageService: BotStorageService

  private key: string
  private webChannel
  private doorOwnerId: number // One of the peer id

  private joinObservable: Observable<JoinEvent>
  private joinObserver: Observer<JoinEvent>
  private leaveSubject: BehaviorSubject<number>
  private messageSubject: ReplaySubject<NetworkMessage>
  private peerJoinSubject: ReplaySubject<number>
  private peerLeaveSubject: ReplaySubject<number>
  private peerSelectionSubject: BehaviorSubject<number>
  private doorSubject: BehaviorSubject<boolean>
  private docTitleSubject: BehaviorSubject<string>

  constructor (botStorageService: BotStorageService) {
    this.botStorageService = botStorageService
    this.doorOwnerId = null
    this.messageSubject = new ReplaySubject<NetworkMessage>()
    this.joinObservable = Observable.create((observer) => {
      this.joinObserver = observer
    })
    this.leaveSubject = new BehaviorSubject<number>(-1)
    this.peerJoinSubject = new ReplaySubject<number>()
    this.peerLeaveSubject = new ReplaySubject<number>()
    this.doorSubject = new BehaviorSubject<boolean>(true)
    this.docTitleSubject = new BehaviorSubject<string>('Untitled document')

    this.initWebChannel()
  }

  initWebChannel () {
    this.webChannel = netflux.create({signalingURL: environment.signalingURL})

    // Leave webChannel before closing tab or browser
    window.addEventListener('beforeunload', (event) => this.webChannel.leave())

    // Peer JOIN event
    this.webChannel.onPeerJoin = (id) => {
      if (this.doorOwnerId === this.webChannel.myId) {
        this.sendDoor(true, true, null, id)
      }
      this.peerJoinSubject.next(id)
    }

    // Peer LEAVE event
    this.webChannel.onPeerLeave = (id) => {
      if (this.doorOwnerId === id) {
        this.setDoor(false)
      }
      this.peerLeaveSubject.next(id)
    }

    // On door closed
    this.webChannel.onClose = () => this.setDoor(false)

    // Message event
    this.webChannel.onMessage = (id, bytes, isBroadcast) => {
      let msg = pb.Message.deserializeBinary(bytes)
      switch (msg.getTypeCase()) {
        case pb.Message.TypeCase.MSG:
          let newMsg = msg.getMsg()
          this.messageSubject.next(new NetworkMessage(newMsg.getService(), id, isBroadcast, newMsg.getContent()))
          break
        case pb.Message.TypeCase.DOOR:
          let door = msg.getDoor()
          if (door.getMustclose() !== null && door.getMustclose()) {
            this.openDoor(false)
          } else {
            if (!door.getOpened()) {
              if (!door.getIntentionally()) {
                // Reopen door or not
              } else {
                  this.setDoor(false)
              }
            } else {
              this.setDoor(true, id)
            }
          }
          break
        case pb.Message.TypeCase.DOC:
          log.debug('Doc title received: ' + msg.getDoc().getTitle())
          this.docTitleSubject.next(msg.getDoc().getTitle())
          break
        case pb.Message.TypeCase.TYPE_NOT_SET:
          log.error('network', 'Protobuf: message type not set')
          break
      }
    }
  }

  newSend (service: string, content: ArrayBuffer, id?: number) {
    let msg = new pb.Message()
    let newmsg = new pb.Newmessage()
    newmsg.setService(service)
    newmsg.setContent(content)
    msg.setMsg(newmsg)
    if (id) {
      this.webChannel.sendTo(id, msg.serializeBinary())
    } else {
      this.webChannel.send(msg.serializeBinary())
    }
  }

  getDoor (): number {
    return this.doorOwnerId
  }

  setDoor (opened: boolean, id: number | null = null): void {
    this.doorOwnerId = id
    this.doorSubject.next(opened)
  }

  openDoor (open: boolean) {
    if (open) {
      // Opening door only if it closed
      if (!this.webChannel.isOpen()) {
        this.webChannel.open({key: this.key})
          .then((openData) => {
            log.info('network', `Opened a door with the signaling: ${this.webChannel.settings.signalingURL}`)
            this.setDoor(true, this.webChannel.myId)
            this.sendDoor(true, true, null)
          })
          .catch((reason) => {
            log.warn('Could not open a door with the signaling: '
              + `${this.webChannel.settings.signalingURL}: ${reason}`, this.webChannel)
          })
      }
    } else {
      // Closing door
      if (this.doorOwnerId !== null) {
        if (this.doorOwnerId === this.webChannel.myId) {
          log.debug('I\'m closing door')
          this.webChannel.close()
          this.sendDoor(false, true, null)
        } else {
          this.sendDoor(null, null, true, this.doorOwnerId)
        }
      }
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

  get onLeave () {
    return this.leaveSubject.asObservable()
  }

  get onPeerJoin () {
    return this.peerJoinSubject.asObservable()
  }

  get onPeerLeave () {
    return this.peerLeaveSubject.asObservable()
  }

  get onPeerSelection () {
    return this.peerSelectionSubject.asObservable()
  }

  get onDoor (): Observable<boolean> {
    return this.doorSubject.asObservable()
  }

  get onDocTitle (): Observable<string> {
    return this.docTitleSubject.asObservable()
  }

  sendDocTitle (title: string): void {
    let docMsg = new pb.Doc()
    docMsg.setTitle(title)
    let msg = new pb.Message()
    msg.setDoc(docMsg)
    this.webChannel.send(msg.serializeBinary())
  }

  sendDoor (opened, intentionally, mustClose, id?: number) {
    let doorMsg = new pb.Door()
    if (mustClose === null) {
      if (opened) {
        doorMsg.setKey(this.key)
      }
      doorMsg.setOpened(opened)
      doorMsg.setIntentionally(intentionally)
    } else {
      doorMsg.setMustclose(mustClose)
    }
    let msg = new pb.Message()
    msg.setDoor(doorMsg)
    if (id) {
      this.webChannel.sendTo(id, msg.serializeBinary())
    } else {
      this.webChannel.send(msg.serializeBinary())
    }
  }

  join (key) {
    // Leave previous webChannel if existing
    this.webChannel.close()
    this.webChannel.leave()
    this.leaveSubject.next(-1)

    this.initWebChannel()

    this.key = key
    // This is for demo to work out of the box.
    // FIXME: change after 8 of December (demo)
    return this.webChannel.open({key})
      .then((openData) => {
        log.info('network', `Opened a door with the signaling: ${this.webChannel.settings.signalingURL}`)
        this.setDoor(true, this.webChannel.myId)
        this.joinObserver.next(new JoinEvent(this.webChannel.myId, key, true))
        if (key === this.botStorageService.currentBot.key) {
          this.inviteBot(this.botStorageService.currentBot.url)
        }
      })
      .catch((reason) => {
        log.warn('Could not open a door with the signaling: '
          + `${this.webChannel.settings.signalingURL}: ${reason}`, this.webChannel)
        return this.webChannel.join(key)
          .then(() => {
            log.info('network', `Joined via the signaling: ${this.webChannel.settings.signalingURL}`)
            this.joinObserver.next(new JoinEvent(this.webChannel.myId, key, false))
          })
          .catch((reason) => {
            log.error('network', `Could not join via the signaling: ${this.webChannel.settings.signalingURL}: ${reason}`)
          })
      })
  }

  send (message: string) {
    this.webChannel(message)
  }

  inviteBot (url: string) {
    this.webChannel.invite(`ws://${url}`)
  }
}
