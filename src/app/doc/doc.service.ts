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

  setTextOperationsStream(textOperationsStream: Observable<any[]>) {
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
        console.log(logootSOperation)
      })
      console.log('doc: ', this.doc)
    })
  }

  handleRemoteOperation(logootSOperation: any) {
    const textOperations: any[] = logootSOperation.execute(this.doc)
    return textOperations
  }

}
