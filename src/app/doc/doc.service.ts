import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'

import { NetworkService } from '../core/network/network.service'

import * as MuteStructs  from 'mute-structs'

@Injectable()
export class DocService {

  private doc: any
  private network: NetworkService
  private remoteTextOperationsStream: Observable<any[]>
  private docSubject: BehaviorSubject<MuteStructs.LogootSRopes>
  private initEditorSubject: BehaviorSubject<string>

  constructor(network: NetworkService) {
    this.doc = new MuteStructs.LogootSRopes(0)
    log.debug('MUTE STRUCTS: ', this.doc)
    this.network = network

    this.initEditorSubject = new BehaviorSubject<string>('')

    this.network.onJoin.subscribe( (id: number) => {
      this.doc = new MuteStructs.LogootSRopes(id)
      // Emit initial value
      this.docSubject = new BehaviorSubject<MuteStructs.LogootSRopes>(this.doc)
      this.network.setDocStream(this.docSubject.asObservable())
    })

    this.network.onJoinDoc
	// Check to filter null values
    .filter( (doc: MuteStructs.LogootSRopes) => doc instanceof MuteStructs.LogootSRopes )
    .subscribe( (doc: MuteStructs.LogootSRopes) => {
      this.doc = doc
      this.docSubject.next(this.doc)
      this.initEditorSubject.next(doc.str)
    })

    this.remoteTextOperationsStream = this.network.onRemoteOperations.map( (logootSOperation: any) => {
      return this.handleRemoteOperation(logootSOperation)
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

  handleTextOperations(array: any[][]) {
    array.forEach( (textOperations: any[]) => {
      textOperations.forEach( (textOperation: any) => {
        const logootSOperation: any = textOperation.applyTo(this.doc)
        if (logootSOperation instanceof MuteStructs.LogootSAdd) {
          this.network.sendLogootSAdd(logootSOperation)
        } else {
          this.network.sendLogootSDel(logootSOperation)
        }
      })
    })
    log.info('operation:doc', 'updated doc: ', this.doc)
    this.docSubject.next(this.doc)
  }

  handleRemoteOperation(logootSOperation: any) {
    const textOperations: any[] = logootSOperation.execute(this.doc)
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

  indexFromId (id: MuteStructs.Identifier) {
    return this.doc.searchPos(id, new Array())
  }

  setTitle (title: string): void {
    log.debug('Sending title: ' + title)
    this.network.sendDocTitle(title)
  }
}
