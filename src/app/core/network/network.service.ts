/// <reference path="../../../../node_modules/@types/node/index.d.ts" />
import { Injectable } from '@angular/core'
import { BehaviorSubject, ReplaySubject, AsyncSubject, Observable } from 'rxjs/Rx'

import * as MuteStructs from 'mute-structs'
import * as netflux from 'netflux'

import { environment } from '../../../environments/environment'
const pb = require('./message_pb.js')

@Injectable()
export class NetworkService {

  private webChannel

  private joinSubject: AsyncSubject<number>
  private peerJoinSubject: ReplaySubject<number>
  private peerLeaveSubject: ReplaySubject<number>
  private peerPseudoSubject: BehaviorSubject<{id: number, pseudo: string}>
  private peerCursorSubject: BehaviorSubject<{id: number, index?: number, identifier?: MuteStructs.Identifier}>
  private peerSelectionSubject: BehaviorSubject<number>

  private remoteOperationsSubject: ReplaySubject<any>

  private queryDocSubject: BehaviorSubject<number>
  private joinDocSubject: BehaviorSubject<MuteStructs.LogootSRopes>

  constructor() {
    this.joinSubject = new AsyncSubject<number>()
    this.peerJoinSubject = new ReplaySubject<number>()
    this.peerLeaveSubject = new ReplaySubject<number>()
    this.peerPseudoSubject = new BehaviorSubject<{id: number, pseudo: string}>({id: -1, pseudo: ''})
    this.peerCursorSubject = new BehaviorSubject<{id: number, index?: number, identifier?: MuteStructs.Identifier}>(
      {id: -1}
    )

    this.remoteOperationsSubject = new ReplaySubject<any>()

    this.queryDocSubject = new BehaviorSubject<number>(0)
    this.joinDocSubject = new BehaviorSubject<MuteStructs.LogootSRopes>(null)

    this.webChannel = netflux.create({signalingURL: environment.signalingURL})

    // Leave webChannel before closing tab or browser
    window.addEventListener('beforeunload', (event) => this.webChannel.leave())

    // Peer JOIN event
    this.webChannel.onPeerJoin = (id) => this.peerJoinSubject.next(id)

    // Peer LEAVE event
    this.webChannel.onPeerLeave = (id) => this.peerLeaveSubject.next(id)

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
          identifier = new MuteStructs.Identifier(protoIdentifier.getBaseList(), protoIdentifier.getLast())
          this.peerCursorSubject.next({id, identifier, index: msg.getPeercursor().getIndex()})
          break
        case pb.Message.TypeCase.LOGOOTSADD:
          const logootSAddMsg = msg.getLogootsadd()
          identifier = new MuteStructs.Identifier(logootSAddMsg.getId().getBaseList(), logootSAddMsg.getId().getLast())
          const logootSAdd: any = new MuteStructs.LogootSAdd(identifier, logootSAddMsg.getContent())
          log.info('operation:network', 'received insert: ', logootSAdd)
          this.remoteOperationsSubject.next(logootSAdd)
          break
        case pb.Message.TypeCase.LOGOOTSDEL:
          const logootSDelMsg: any = msg.getLogootsdel()
          const lid: any = logootSDelMsg.getLidList().map( (identifier: any) => {
            return new MuteStructs.IdentifierInterval(identifier.getBaseList(), identifier.getBegin(), identifier.getEnd())
          })
          const logootSDel: any = new MuteStructs.LogootSDel(lid)
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

          const doc: MuteStructs.LogootSRopes = MuteStructs.LogootSRopes.fromPlain(myId, clock, plainDoc)
          this.joinDocSubject.next(doc)
          break
        case pb.Message.TypeCase.TYPE_NOT_SET:
          log.error('network', 'Protobuf: message type not set')
          break
      }
    }
  }

  get onJoin () {
    return this.joinSubject.asObservable()
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

  get onPeerSelection() {
    return this.peerSelectionSubject.asObservable()
  }

  get onRemoteOperations() {
    return this.remoteOperationsSubject.asObservable()
  }

  get onJoinDoc() {
    return this.joinDocSubject.asObservable()
  }

  setDocStream (docStream: Observable<MuteStructs.LogootSRopes>) {
    this.queryDocSubject
    .filter( (id: number) => id > 0)
    .withLatestFrom(
      docStream,
      (id: number, doc: MuteStructs.LogootSRopes) => {
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

  sendDoc (id: number, doc: MuteStructs.LogootSRopes) {
    const msg = new pb.Message()

    const logootSRopesMsg = new pb.LogootSRopes()
    logootSRopesMsg.setStr(doc.str)

    if (doc.root instanceof MuteStructs.RopesNodes) {
      const ropesMsg = this.generateRopesNodeMsg(doc.root)
      logootSRopesMsg.setRoot(ropesMsg)
    }

    msg.setLogootsropes(logootSRopesMsg)

    this.webChannel.sendTo(id, msg.serializeBinary())
  }

  generateRopesNodeMsg (ropesNode: MuteStructs.RopesNodes): any {
    const ropesNodeMsg = new pb.RopesNode()

    const blockMsg = this.generateBlockMsg(ropesNode.block)
    ropesNodeMsg.setBlock(blockMsg)

    if (ropesNode.left instanceof MuteStructs.RopesNodes) {
      ropesNodeMsg.setLeft(this.generateRopesNodeMsg(ropesNode.left))
    }

    if (ropesNode.right instanceof MuteStructs.RopesNodes) {
      ropesNodeMsg.setRight(this.generateRopesNodeMsg(ropesNode.right))
    }

    ropesNodeMsg.setOffset(ropesNode.offset)
    ropesNodeMsg.setLength(ropesNode.length)

    return ropesNodeMsg
  }

  generateBlockMsg (block: MuteStructs.LogootSBlock): any {
    const blockMsg = new pb.LogootSBlock()

    blockMsg.setId(this.generateIdentifierInterval(block.id))
    blockMsg.setNbelement(block.nbElement)

    return blockMsg
  }

  generateIdentifierInterval (id: MuteStructs.IdentifierInterval): any {
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
    // This is for demo to work out of the box.
    // FIXME: change after 8 of December (demo)
    return this.webChannel.open({key})
      .then(() => {
        log.info('network', `Opened a door with the signaling: ${this.webChannel.settings.signalingURL}`)
        this.joinSubject.next(this.webChannel.myId)
        this.joinSubject.complete()
      })
      .catch((reason) => {
        log.warn('Could not open a door with the signaling: '
          + `${this.webChannel.settings.signalingURL}: ${reason}`, this.webChannel)
        return this.webChannel.join(key)
          .then(() => {
            log.info('network', `Joined via the signaling: ${this.webChannel.settings.signalingURL}`)
            this.joinSubject.next(this.webChannel.myId)
            this.joinSubject.complete()
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

}

class QueryDocEvent {
  public id: number
  public doc: MuteStructs.LogootSRopes
  constructor(id: number, doc: MuteStructs.LogootSRopes) {
    this.id = id
    this.doc = doc
  }
}
