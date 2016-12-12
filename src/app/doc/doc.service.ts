import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable, Observer } from 'rxjs'

import { NetworkService, NetworkMessage } from 'core/network'

import { Identifier, IdentifierInterval, LogootSAdd, LogootSDel, LogootSRopes, TextInsert, TextDelete }  from 'mute-structs'

const pb = require('./message_pb.js')

@Injectable()
export class DocService {

  private doc: any
  private network: NetworkService
  private remoteTextOperationsStream: Observable<TextInsert[] | TextDelete[]>
  private remoteOperationsObserver: Observer<TextInsert[] | TextDelete[]>
  private docSubject: BehaviorSubject<LogootSRopes>
  private initEditorSubject: BehaviorSubject<string>

  constructor(network: NetworkService) {
    this.doc = new LogootSRopes(0)
    log.debug('MUTE STRUCTS: ', this.doc)
    this.network = network

    this.initEditorSubject = new BehaviorSubject<string>('')

    this.network.onJoin.subscribe( (id: number) => {
      this.doc = new LogootSRopes(id)
      // Emit initial value
      this.docSubject = new BehaviorSubject<LogootSRopes>(this.doc)
      this.initEditorSubject.next(this.doc.str)
      this.network.setDocStream(this.docSubject.asObservable())
    })

    this.network.onJoinDoc
    // Check to filter null values
    .filter( (doc: LogootSRopes) => doc instanceof LogootSRopes )
    .subscribe( (doc: LogootSRopes) => {
      this.doc = doc
      this.docSubject.next(this.doc)
      this.initEditorSubject.next(doc.str)
    })

    this.remoteTextOperationsStream = Observable.create((observer) => {
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
          console.log('operation:network', 'received insert: ', logootSAdd)
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
      }
    })

  }

  setLocalTextOperationsStream(textOperationsStream: Observable<any[]>) {
    textOperationsStream.subscribe( (array: any[][]) => {
      this.handleTextOperations(array)
    })
  }

  getInitEditorStream(): Observable<string> {
    return this.initEditorSubject.asObservable()
  }

  getRemoteTextOperationsStream(): Observable<any[]> {
    return this.remoteTextOperationsStream
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
    this.docSubject.next(this.doc)
  }

  handleRemoteOperation(logootSOperation: LogootSAdd | LogootSDel): TextInsert[] | TextDelete[] {
    const textOperations: TextInsert[] | TextDelete[] = logootSOperation.execute(this.doc)
    log.info('operation:doc', 'updated doc: ', this.doc)
    this.docSubject.next(this.doc)
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

  generateIdentifierInterval (id: IdentifierInterval): any {
    const identifierInterval = new pb.IdentifierInterval()

    identifierInterval.setBaseList(id.base)
    identifierInterval.setBegin(id.begin)
    identifierInterval.setEnd(id.end)

    return identifierInterval
  }
}
