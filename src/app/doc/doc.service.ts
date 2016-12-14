import { Injectable } from '@angular/core'
import { Observable, Observer } from 'rxjs'

import { JoinEvent, NetworkService, NetworkMessage } from 'core/network'

import {
  LogootSAdd,
  LogootSDel,
  LogootSBlock,
  LogootSRopes,
  Identifier,
  IdentifierInterval,
  RopesNodes,
  TextInsert,
  TextDelete
} from 'mute-structs'

const pb = require('./message_pb.js')

@Injectable()
export class DocService {

  private doc: any
  private network: NetworkService
  private remoteOperationsObservable: Observable<TextInsert[] | TextDelete[]>
  private remoteOperationsObserver: Observer<TextInsert[] | TextDelete[]>
  private docValueObservable: Observable<string>
  private docValueObserver: Observer<string>

  constructor(network: NetworkService) {
    this.doc = new LogootSRopes(0)
    this.network = network

    this.docValueObservable = Observable.create((observer) => {
      this.docValueObserver = observer
    })

    this.network.onJoin.subscribe( (joinEvent: JoinEvent) => {
      this.doc = new LogootSRopes(joinEvent.id)
      if (!joinEvent.created) {
        this.sendQueryDoc()
      } else {
        // Emit initial value
        this.docValueObserver.next(this.doc.str)
      }
    })

    this.remoteOperationsObservable = Observable.create((observer) => {
      this.remoteOperationsObserver = observer
    })

    this.network.onMessage
    .filter((msg: NetworkMessage) => msg.service === this.constructor.name)
    .subscribe((msg: NetworkMessage) => {
      const content = new pb.Doc.deserializeBinary(msg.content)
      switch (content.getTypeCase()) {
        case pb.Doc.TypeCase.LOGOOTSADD:
          const logootSAddMsg = content.getLogootsadd()
          const identifier: Identifier = new Identifier(logootSAddMsg.getId().getBaseList(), logootSAddMsg.getId().getLast())
          const logootSAdd: LogootSAdd = new LogootSAdd(identifier, logootSAddMsg.getContent())
          log.info('operation:network', 'received insert: ', logootSAdd)
          this.remoteOperationsObserver.next(this.handleRemoteOperation(logootSAdd))
          break
        case pb.Doc.TypeCase.LOGOOTSDEL:
          const logootSDelMsg: any = content.getLogootsdel()
          const lid: any = logootSDelMsg.getLidList().map( (identifier: any) => {
            return new IdentifierInterval(identifier.getBaseList(), identifier.getBegin(), identifier.getEnd())
          })
          const logootSDel: any = new LogootSDel(lid)
          log.info('operation:network', 'received delete: ', logootSDel)
          this.remoteOperationsObserver.next(this.handleRemoteOperation(logootSDel))
          break
        case pb.Doc.TypeCase.LOGOOTSROPES:
          const myId: number = this.network.myId
          const clock = 0

          const plainDoc: any = content.toObject().logootsropes

          // Protobuf rename keys like 'base' to 'baseList' because, just because...
          if (plainDoc.root instanceof Object) {
            this.renameKeys(plainDoc.root)
          }

          this.doc = LogootSRopes.fromPlain(myId, clock, plainDoc)
          this.docValueObserver.next(this.doc.str)
          break
        case pb.Doc.TypeCase.QUERYDOC:
          this.sendDoc(msg.id)
          break
      }
    })

  }

  setLocalTextOperationsStream(textOperationsStream: Observable<any[]>) {
    textOperationsStream.subscribe( (array: any[][]) => {
      this.handleTextOperations(array)
    })
  }

  get onDocValue(): Observable<string> {
    return this.docValueObservable
  }

  get onRemoteOperations(): Observable<TextInsert[] | TextDelete[]> {
    return this.remoteOperationsObservable
  }

  handleTextOperations(array: any[][]): void {
    array.forEach( (textOperations: any[]) => {
      textOperations.forEach( (textOperation: any) => {
        const logootSOperation: any = textOperation.applyTo(this.doc)
        if (logootSOperation instanceof LogootSAdd) {
          this.sendLogootSAdd(logootSOperation)
        } else {
          this.sendLogootSDel(logootSOperation)
        }
      })
    })
    log.info('operation:doc', 'updated doc: ', this.doc)
  }

  handleRemoteOperation(logootSOperation: LogootSAdd | LogootSDel): TextInsert[] | TextDelete[] {
    const textOperations: TextInsert[] | TextDelete[] = logootSOperation.execute(this.doc)
    log.info('operation:doc', 'updated doc: ', this.doc)
    return textOperations
  }

  idFromIndex (index: number): {index: number, last: number, base: number[]} | null {
    let respIntnode = this.doc.searchNode(index)
    if (respIntnode !== null) {
      return {
        index: respIntnode.i,
        last: respIntnode.node.offset + respIntnode.i,
        base: respIntnode.node.block.id.base
      }
    }
    return null
  }

  indexFromId (id: Identifier): number {
    return this.doc.searchPos(id, new Array())
  }

  setTitle (title: string): void {
    log.debug('Sending title: ' + title)
    this.network.sendDocTitle(title)
  }

  sendLogootSAdd (logootSAdd: LogootSAdd): void {
    const identifier = new pb.Identifier()

    identifier.setBaseList(logootSAdd.id.base)
    identifier.setLast(logootSAdd.id.last)

    const logootSAddMsg = new pb.LogootSAdd()
    logootSAddMsg.setId(identifier)
    logootSAddMsg.setContent(logootSAdd.l)

    const msg = new pb.Doc()
    msg.setLogootsadd(logootSAddMsg)

    this.network.newSend(this.constructor.name, msg.serializeBinary())
  }

  sendLogootSDel (logootSDel: LogootSDel): void {
    const lid: any[] = logootSDel.lid.map( (id: any) => {
      const identifierInterval: any = this.generateIdentifierInterval(id)
      return identifierInterval
    })

    const logootSDelMsg = new pb.LogootSDel()
    logootSDelMsg.setLidList(lid)

    const msg = new pb.Doc()
    msg.setLogootsdel(logootSDelMsg)

    this.network.newSend(this.constructor.name, msg.serializeBinary())
  }

  sendDoc (id: number) {
    const msg = new pb.Doc()

    const logootSRopesMsg = new pb.LogootSRopes()
    logootSRopesMsg.setStr(this.doc.str)

    if (this.doc.root instanceof RopesNodes) {
      const ropesMsg = this.generateRopesNodeMsg(this.doc.root)
      logootSRopesMsg.setRoot(ropesMsg)
    }
    msg.setLogootsropes(logootSRopesMsg)

    this.network.newSend(this.constructor.name, msg.serializeBinary(), id)
  }

  sendQueryDoc (): void {
    const msg = new pb.Doc()

    const queryDoc = new pb.QueryDoc()
    msg.setQuerydoc(queryDoc)

    const peerDoor: number = this.network.members[0]
    this.network.newSend(this.constructor.name, msg.serializeBinary(), peerDoor)
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
}
