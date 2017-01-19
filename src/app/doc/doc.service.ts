import { Injectable } from '@angular/core'
import { Observable, Observer, Subscription } from 'rxjs'
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

import { JoinEvent, NetworkService, NetworkMessage } from 'doc/network'
import { LocalStorageService } from 'core/storage/local-storage/local-storage.service'
const pb = require('./message_pb.js')

@Injectable()
export class DocService {

  private doc: LogootSRopes
  private docID: string

  private docValueObservable: Observable<string>
  private docValueObserver: Observer<string>

  private localLogootSOperationObservable: Observable<LogootSAdd | LogootSDel>
  private localLogootSOperationObservers: Observer<LogootSAdd | LogootSDel>[] = []

  private remoteTextOperationsObservable: Observable<TextInsert[] | TextDelete[]>
  private remoteTextOperationsObservers: Observer<TextInsert[] | TextDelete[]>[] = []

  private joinSubscription: Subscription
  private localOperationsSubscription: Subscription
  private messageSubscription: Subscription

  constructor (
    private localStorageService: LocalStorageService,
    private network: NetworkService
  ) {
    log.angular('DocService constructor')
    this.doc = new LogootSRopes()

    this.docValueObservable = Observable.create((observer) => {
      this.docValueObserver = observer
    })

    this.localLogootSOperationObservable = Observable.create((observer) => {
      this.localLogootSOperationObservers.push(observer)
    })
    })

    this.remoteTextOperationsObservable = Observable.create((observer) => {
      this.remoteTextOperationsObservers.push(observer)
    })
  }

  set localTextOperationsSource (source: Observable<(TextDelete | TextInsert)[][]>) {
    this.localOperationsSubscription = source.subscribe((textOperations: (TextDelete | TextInsert)[][]) => {
      this.handleTextOperations(textOperations)
    })
  }

  set remoteLogootSOperationSource (source: Observable<LogootSAdd | LogootSDel>) {
    source.subscribe((logootSOp: LogootSAdd | LogootSDel) => {
      this.remoteTextOperationsObservers.forEach((observer: Observer<(TextInsert | TextDelete)[]>) => {
        observer.next(this.handleRemoteOperation(logootSOp))
      })
    })
  }

  set joinSource (source: Observable<JoinEvent>) {
    this.joinSubscription = source.subscribe( (joinEvent: JoinEvent) => {
      this.docID = joinEvent.key
      if (!joinEvent.created) {
        // Have to retrieve the document from another peer
        this.sendQueryDoc()
      } else {
        // Try to retrieve the document from the local database
        this.localStorageService.get(this.docID)
        .then((plainDoc: any) => {
          const doc: LogootSRopes | null = this.generateDoc(plainDoc)

          if (doc instanceof LogootSRopes) {
            this.doc = doc
          } else {
            // TODO: Handle this error properly
            log.error('logootsropes:doc', 'retrieved invalid document')
            this.doc = new LogootSRopes(joinEvent.id)
          }
          this.docValueObserver.next(this.doc.str)
        }, () => {
          // Was not able to retrieve the document
          // Create a new one
          this.doc = new LogootSRopes(joinEvent.id)
          this.docValueObserver.next(this.doc.str)
        })
      }
    })
  }

  set messageSource (source: Observable<NetworkMessage>) {
    this.messageSubscription = source
    .filter((msg: NetworkMessage) => msg.service === this.constructor.name)
    .subscribe((msg: NetworkMessage) => {
      const content = new pb.Doc.deserializeBinary(msg.content)
      switch (content.getTypeCase()) {
        case pb.Doc.TypeCase.LOGOOTSROPES:
          const plainDoc: any = content.toObject().logootsropes

          // Protobuf rename keys like 'base' to 'baseList' because, just because...
          if (plainDoc.root instanceof Object) {
            this.renameKeys(plainDoc.root)
          }

          const doc: LogootSRopes | null = this.generateDoc(plainDoc)

          if (doc instanceof LogootSRopes) {
            this.doc = doc
            this.docValueObserver.next(this.doc.str)
          } else {
            // TODO: Handle this error properly
            log.error('logootsropes:doc', 'received invalid document')
          }
          break
        case pb.Doc.TypeCase.QUERYDOC:
          this.sendDoc(msg.id)
          break
      }
    })
  }

  get onDocValue (): Observable<string> {
    return this.docValueObservable
  }

  get onLocalLogootSOperation (): Observable<LogootSAdd | LogootSDel> {
    return this.localLogootSOperationObservable
  }

  get onRemoteTextOperations (): Observable<TextInsert[] | TextDelete[]> {
    return this.remoteTextOperationsObservable
  }

  generateDoc (plainDoc: any): LogootSRopes | null {
    const myId: number = this.network.myId
    const clock = 0

    return LogootSRopes.fromPlain(myId, clock, plainDoc)
  }

  saveDoc (): void {
    this.localStorageService.put(this.docID, { root: this.doc.root, str: this.doc.str })
    .then(() => {}, () => {
      // TODO: Handle this error properly
    })
  }

  clean () {
    this.joinSubscription.unsubscribe()
    this.localOperationsSubscription.unsubscribe()
    this.messageSubscription.unsubscribe()
  }

  handleTextOperations (array: any[][]): void {
    array.forEach( (textOperations: any[]) => {
      textOperations.forEach( (textOperation: any) => {
        const logootSOperation: LogootSAdd | LogootSDel = textOperation.applyTo(this.doc)
        this.localLogootSOperationObservers.forEach((observer: Observer<LogootSAdd | LogootSDel>) => {
          observer.next(logootSOperation)
        })
      })
    })
    this.saveDoc()
    log.info('operation:doc', 'updated doc: ', this.doc)
  }

  handleRemoteOperation (logootSOperation: LogootSAdd | LogootSDel): TextInsert[] | TextDelete[] {
    const textOperations: TextInsert[] | TextDelete[] = logootSOperation.execute(this.doc)
    this.saveDoc()
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

  sendDoc (id: number): void {
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
  renameKeys (node: {block: {id: any, nbElement?: any, nbelement: number}, right?: any, left?: any}): void {
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
