/// <reference path="../../../../node_modules/@types/node/index.d.ts" />
import { Injectable } from '@angular/core'
import { BehaviorSubject, ReplaySubject, Observable } from 'rxjs/Rx'

import {
  LogootSAdd,
  LogootSDel,
  LogootSBlock,
  LogootSRopes,
  Identifier,
  IdentifierInterval,
  RopesNodes
} from 'mute-structs'
import * as netflux from 'netflux'
import { BotStorageService } from '../bot-storage/bot-storage.service'
import { environment } from '../../../environments/environment'
const pb = require('./message_pb.js')

export { Identifier, LogootSRopes }

@Injectable()
export class NetworkService {

  private botStorageService: BotStorageService

  private key: string
  private webChannel
  private doorOwnerId: number // One of the peer id

  private joinSubject: BehaviorSubject<number>
  private leaveSubject: BehaviorSubject<number>
  private peerJoinSubject: ReplaySubject<number>
  private peerLeaveSubject: ReplaySubject<number>
  private peerPseudoSubject: BehaviorSubject<{id: number, pseudo: string}>
  private peerCursorSubject: BehaviorSubject<{id: number, index?: number, identifier?: Identifier}>
  private peerSelectionSubject: BehaviorSubject<number>
  private doorSubject: BehaviorSubject<boolean>
  private docTitleSubject: BehaviorSubject<string>

  private remoteOperationsSubject: ReplaySubject<any>

  private queryDocSubject: BehaviorSubject<number>
  private joinDocSubject: BehaviorSubject<LogootSRopes>

  constructor (botStorageService: BotStorageService) {
    this.botStorageService = botStorageService
    this.doorOwnerId = null
    this.joinSubject = new BehaviorSubject<number>(-1)
    this.leaveSubject = new BehaviorSubject<number>(-1)
    this.peerJoinSubject = new ReplaySubject<number>()
    this.peerLeaveSubject = new ReplaySubject<number>()
    this.peerPseudoSubject = new BehaviorSubject<{id: number, pseudo: string}>({id: -1, pseudo: ''})
    this.peerCursorSubject = new BehaviorSubject<{id: number, index?: number, identifier?: Identifier}>(
      {id: -1}
    )
    this.doorSubject = new BehaviorSubject<boolean>(true)
    this.docTitleSubject = new BehaviorSubject<string>('Untitled document')

    this.remoteOperationsSubject = new ReplaySubject<any>()

    this.queryDocSubject = new BehaviorSubject<number>(0)
    this.joinDocSubject = new BehaviorSubject<LogootSRopes>(null)

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
      let identifier
      switch (msg.getTypeCase()) {
        case pb.Message.TypeCase.PEERPSEUDO:
          this.peerPseudoSubject.next({ id, pseudo: msg.getPeerpseudo().getPseudo() })
          break
        case pb.Message.TypeCase.PEERCURSOR:
          const protoIdentifier = msg.getPeercursor().getId()
          identifier = new Identifier(protoIdentifier.getBaseList(), protoIdentifier.getLast())
          this.peerCursorSubject.next({id, identifier, index: msg.getPeercursor().getIndex()})
          break
        case pb.Message.TypeCase.LOGOOTSADD:
          const logootSAddMsg = msg.getLogootsadd()
          identifier = new Identifier(logootSAddMsg.getId().getBaseList(), logootSAddMsg.getId().getLast())
          const logootSAdd: any = new LogootSAdd(identifier, logootSAddMsg.getContent())
          log.info('operation:network', 'received insert: ', logootSAdd)
          this.remoteOperationsSubject.next(logootSAdd)
          break
        case pb.Message.TypeCase.LOGOOTSDEL:
          const logootSDelMsg: any = msg.getLogootsdel()
          const lid: any = logootSDelMsg.getLidList().map( (identifier: any) => {
            return new IdentifierInterval(identifier.getBaseList(), identifier.getBegin(), identifier.getEnd())
          })
          const logootSDel: any = new LogootSDel(lid)
          log.info('operation:network', 'received delete: ', logootSDel)
          this.remoteOperationsSubject.next(logootSDel)
          break
        case pb.Message.TypeCase.QUERYDOC:
          this.queryDocSubject.next(id)
          break
        case pb.Message.TypeCase.LOGOOTSROPES:
          const myId: number = this.webChannel.myId
          const clock = 0

          const plainDoc: any = msg.toObject().logootsropes

          // Protobuf rename keys like 'base' to 'baseList' because, just because...
          if (plainDoc.root instanceof Object) {
            this.renameKeys(plainDoc.root)
          }

          const doc: LogootSRopes = LogootSRopes.fromPlain(myId, clock, plainDoc)
          this.joinDocSubject.next(doc)
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
          log.debug('Dos title received: ' + msg.getDoc().getTitle())
          this.docTitleSubject.next(msg.getDoc().getTitle())
          break
        case pb.Message.TypeCase.TYPE_NOT_SET:
          log.error('network', 'Protobuf: message type not set')
          break
      }
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

  get onJoin () {
    return this.joinSubject.asObservable()
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

  get onPeerPseudo () {
    return this.peerPseudoSubject.asObservable()
  }

  get onPeerCursor () {
    return this.peerCursorSubject.asObservable()
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

  get onRemoteOperations() {
    return this.remoteOperationsSubject.asObservable()
  }

  get onJoinDoc() {
    return this.joinDocSubject.asObservable()
  }

  setDocStream (docStream: Observable<LogootSRopes>) {
    this.queryDocSubject
    .filter( (id: number) => id > 0)
    .withLatestFrom(
      docStream,
      (id: number, doc: LogootSRopes) => {
        return new QueryDocEvent(id, doc)
      }
    ).subscribe( (queryDocEvent: QueryDocEvent) => {
      this.sendDoc(queryDocEvent.id, queryDocEvent.doc)
    })
  }

  sendPeerPseudo (pseudo: string, id: number = -1) {
    let pseudoMsg = new pb.PeerPseudo()
    pseudoMsg.setPseudo(pseudo)
    let msg = new pb.Message()
    msg.setPeerpseudo(pseudoMsg)
    if (id !== -1) {
      this.webChannel.sendTo(id, msg.serializeBinary())
    } else {
      this.webChannel.send(msg.serializeBinary())
    }
  }

  sendPeerCursor (cursor: {index: number, last?: number, base?: number[]}) {
    if (cursor !== null) {
      const identifier = new pb.Identifier()

      identifier.setBaseList(cursor.base)
      identifier.setLast(cursor.last)

      const peerCursor = new pb.PeerCursor()
      peerCursor.setId(identifier)
      peerCursor.setIndex(cursor.index)

      const msg = new pb.Message()
      msg.setPeercursor(peerCursor)

      this.webChannel.send(msg.serializeBinary())
    }
  }

  sendLogootSAdd (logootSAdd: any) {
    const identifier = new pb.Identifier()

    identifier.setBaseList(logootSAdd.id.base)
    identifier.setLast(logootSAdd.id.last)

    const logootSAddMsg = new pb.LogootSAdd()
    logootSAddMsg.setId(identifier)
    logootSAddMsg.setContent(logootSAdd.l)

    const msg = new pb.Message()
    msg.setLogootsadd(logootSAddMsg)

    this.webChannel.send(msg.serializeBinary())
  }

  sendLogootSDel (logootSDel: any) {
    const lid: any[] = logootSDel.lid.map( (id: any) => {
      const identifierInterval: any = this.generateIdentifierInterval(id)
      return identifierInterval
    })

    const logootSDelMsg = new pb.LogootSDel()
    logootSDelMsg.setLidList(lid)

    const msg = new pb.Message()
    msg.setLogootsdel(logootSDelMsg)

    this.webChannel.send(msg.serializeBinary())
  }

  sendQueryDoc () {
    const msg = new pb.Message()

    const queryDoc = new pb.QueryDoc()
    msg.setQuerydoc(queryDoc)

    const peerDoor: number = this.webChannel.members[0]

    this.webChannel.sendTo(peerDoor, msg.serializeBinary())
  }

  sendDoc (id: number, doc: LogootSRopes) {
    const msg = new pb.Message()

    const logootSRopesMsg = new pb.LogootSRopes()
    logootSRopesMsg.setStr(doc.str)

    if (doc.root instanceof RopesNodes) {
      const ropesMsg = this.generateRopesNodeMsg(doc.root)
      logootSRopesMsg.setRoot(ropesMsg)
    }

    msg.setLogootsropes(logootSRopesMsg)

    this.webChannel.sendTo(id, msg.serializeBinary())
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

  generateRopesNodeMsg (ropesNode: RopesNodes): any {
    const ropesNodeMsg = new pb.RopesNode()

    const blockMsg = this.generateBlockMsg(ropesNode.block)
    ropesNodeMsg.setBlock(blockMsg)

    if (ropesNode.left instanceof RopesNodes) {
      ropesNodeMsg.setLeft(this.generateRopesNodeMsg(ropesNode.left))
    }

    if (ropesNode.right instanceof RopesNodes) {
      ropesNodeMsg.setRight(this.generateRopesNodeMsg(ropesNode.right))
    }

    ropesNodeMsg.setOffset(ropesNode.offset)
    ropesNodeMsg.setLength(ropesNode.length)

    return ropesNodeMsg
  }

  generateBlockMsg (block: LogootSBlock): any {
    const blockMsg = new pb.LogootSBlock()

    blockMsg.setId(this.generateIdentifierInterval(block.id))
    blockMsg.setNbelement(block.nbElement)

    return blockMsg
  }

  generateIdentifierInterval (id: IdentifierInterval): any {
    const identifierInterval = new pb.IdentifierInterval()

    identifierInterval.setBaseList(id.base)
    identifierInterval.setBegin(id.begin)
    identifierInterval.setEnd(id.end)

    return identifierInterval
  }

  // FIXME: Prevent Protobuf from renaming our fields or move this code elsewhere
  renameKeys (node: {block: {id: any, nbElement?: any, nbelement: number}, right?: any, left?: any}) {
    node.block.id.base = node.block.id.baseList
    node.block.nbElement = node.block.nbelement
    if (node.left) {
      this.renameKeys(node.left)
    }
    if (node.right) {
      this.renameKeys(node.right)
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
        this.joinSubject.next(this.webChannel.myId)
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
            this.joinSubject.next(this.webChannel.myId)
            this.sendQueryDoc()
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

class QueryDocEvent {
  public id: number
  public doc: LogootSRopes
  constructor(id: number, doc: LogootSRopes) {
    this.id = id
    this.doc = doc
  }
}
