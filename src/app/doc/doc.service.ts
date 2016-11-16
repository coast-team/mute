import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'

import { NetworkService } from '../core/network/network.service'

import * as MuteStructs  from 'mute-structs'

@Injectable()
export class DocService {

  private doc: any
  private network: NetworkService
  private remoteTextOperationsStream: Observable<any[]>

  constructor(network: NetworkService) {
    this.doc = new MuteStructs.LogootSRopes(0)
    this.network = network
    this.remoteTextOperationsStream = this.network.onRemoteOperations.map( (logootSOperation: any) => {
      return this.handleRemoteOperation(logootSOperation)
    })
  }

  setLocalTextOperationsStream(textOperationsStream: Observable<any[]>) {
    textOperationsStream.subscribe( (array: any[][]) => {
      this.handleTextOperations(array)
    })
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
  }

  handleRemoteOperation(logootSOperation: any) {
    const textOperations: any[] = logootSOperation.execute(this.doc)
    this.updateDocString(textOperations)
    return textOperations
  }

  updateDocString(textOperations: any[]) {
    textOperations.forEach( (textOperation: any) => {
      const currentStr: string = this.doc.str
      if (textOperation instanceof MuteStructs.TextInsert) {
        this.doc.str = currentStr.substring(0, textOperation.offset) + textOperation.content + currentStr.substring(textOperation.offset)
      } else {
        this.doc.str = currentStr.substring(0, textOperation.offset) + currentStr.substring(textOperation.offset + textOperation.length)
      }
    })
  }

}
