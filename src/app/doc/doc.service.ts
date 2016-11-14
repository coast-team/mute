import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'

import * as MuteStructs  from 'mute-structs'

@Injectable()
export class DocService {

  private doc: any

  constructor() {
    this.doc = new MuteStructs.LogootSRopes(0)
  }

  setTextOperationsStream(textOperationsStream: Observable<any[]>) {
    textOperationsStream.subscribe( (array: any[][]) => {
      this.handleTextOperations(array)
    })
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

}
