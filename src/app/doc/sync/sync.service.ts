import { Injectable } from '@angular/core'
import { LogootSDel, LogootSAdd } from 'mute-structs'
import { Observable, Observer } from 'rxjs'

import { RichLogootSOperation } from './RichLogootSOperation'

@Injectable()
export class SyncService {

  private id: number = -1
  private clock: number = 0

  private localRichLogootSOperationObservable: Observable<RichLogootSOperation>
  private localRichLogootSOperationObservers: Observer<RichLogootSOperation>[] = []

  private remoteLogootSOperationObservable: Observable<LogootSAdd | LogootSDel>
  private remoteLogootSOperationObservers: Observer<LogootSAdd | LogootSDel>[] = []

  constructor () {
    this.localRichLogootSOperationObservable = Observable.create((observer) => {
      this.localRichLogootSOperationObservers.push(observer)
    })

    this.remoteLogootSOperationObservable = Observable.create((observer) => {
      this.remoteLogootSOperationObservers.push(observer)
    })

  }

  get onLocalRichLogootSOperation (): Observable<RichLogootSOperation> {
    return this.localRichLogootSOperationObservable
  }

  get onRemoteLogootSOperation (): Observable<LogootSAdd | LogootSDel> {
    return this.remoteLogootSOperationObservable
  }

  set localLogootSOperationSource (source: Observable<LogootSAdd | LogootSDel>) {
    source.subscribe((logootSOp: LogootSAdd | LogootSDel) => {
      const richLogootSOp: RichLogootSOperation = new RichLogootSOperation(this.id, this.clock, logootSOp)

      this.localRichLogootSOperationObservers.forEach((observer: Observer<RichLogootSOperation>) => {
        observer.next(richLogootSOp)
      })

      this.clock++
    })
  }

  set remoteRichLogootSOperationSource (source: Observable<RichLogootSOperation>) {
    source.subscribe((richLogootSOp: RichLogootSOperation) => {
      this.applyRichLogootSOperation(richLogootSOp)
    })
  }

  applyRichLogootSOperation (richLogootSOp: RichLogootSOperation): void {
    this.remoteLogootSOperationObservers.forEach((observer: Observer<LogootSAdd | LogootSDel>) => {
      observer.next(richLogootSOp.logootSOp)
    })
  }

}
